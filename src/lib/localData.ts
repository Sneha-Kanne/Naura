import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const getFilePath = (collection: string) => path.join(DATA_DIR, `${collection}.json`);

const readCollection = (collection: string) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

const writeCollection = (collection: string, data: any) => {
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const localDB = {
  users: {
    find: (query: any) => {
      const users = readCollection('users');
      return users.filter((u: any) => Object.keys(query).every(key => u[key] === query[key]));
    },
    findOne: (query: any) => {
      const users = readCollection('users');
      return users.find((u: any) => Object.keys(query).every(key => u[key] === query[key]));
    },
    create: (data: any) => {
      const users = readCollection('users');
      const newUser = { ...data, _id: Date.now().toString(), createdAt: new Date().toISOString() };
      users.push(newUser);
      writeCollection('users', users);
      return newUser;
    }
  },
  tasks: {
    find: (query: any) => {
      const tasks = readCollection('tasks');
      return tasks.filter((t: any) => {
        return Object.keys(query).every(key => {
          if (query[key] && typeof query[key] === 'object') {
            if (query[key].$lt) return new Date(t[key]) < new Date(query[key].$lt);
            if (query[key].$in) return query[key].$in.includes(t[key]);
          }
          return t[key] === query[key];
        });
      });
    },
    create: (data: any) => {
      const tasks = readCollection('tasks');
      const newTask = { ...data, _id: Date.now().toString(), createdAt: new Date().toISOString() };
      tasks.push(newTask);
      writeCollection('tasks', tasks);
      return newTask;
    },
    findOne: (query: any) => {
      const tasks = readCollection('tasks');
      return tasks.find((t: any) => Object.keys(query).every(key => t[key] === query[key]));
    },
    findOneAndUpdate: (query: any, update: any) => {
      const tasks = readCollection('tasks');
      const index = tasks.findIndex((t: any) => Object.keys(query).every(key => t[key] === query[key]));
      if (index === -1) return null;
      
      const updated = { ...tasks[index], ...update };
      tasks[index] = updated;
      writeCollection('tasks', tasks);
      return updated;
    },
    updateMany: (query: any, update: any) => {
      const tasks = readCollection('tasks');
      let updatedCount = 0;
      const updatedTasks = tasks.map((t: any) => {
        const match = Object.keys(query).every(key => {
          if (query[key] && typeof query[key] === 'object') {
            if (query[key].$in) return query[key].$in.includes(t[key]);
          }
          return t[key] === query[key];
        });

        if (match) {
          updatedCount++;
          return { ...t, ...update.$set };
        }
        return t;
      });
      writeCollection('tasks', updatedTasks);
      return { modifiedCount: updatedCount };
    }
  },
  configs: {
    findOne: (query: any) => {
      const configs = readCollection('configs');
      return configs.find((c: any) => Object.keys(query).every(key => c[key] === query[key]));
    },
    create: (data: any) => {
      const configs = readCollection('configs');
      const newConfig = { ...data, _id: Date.now().toString() };
      configs.push(newConfig);
      writeCollection('configs', configs);
      return newConfig;
    },
    findOneAndUpdate: (query: any, update: any, options: any = {}) => {
      const configs = readCollection('configs');
      let config = configs.find((c: any) => Object.keys(query).every(key => c[key] === query[key]));
      
      if (!config) {
        if (options.upsert) {
          config = { ...query, auraScore: 0, _id: Date.now().toString() };
          configs.push(config);
        } else {
          return null;
        }
      }

      if (update.$inc) {
        config.auraScore = (config.auraScore || 0) + update.$inc.auraScore;
      }
      if (update.$set) {
        Object.assign(config, update.$set);
      }

      writeCollection('configs', configs);
      return config;
    }
  },
  extraLogs: {
    countDocuments: (query: any) => {
      const logs = readCollection('extraLogs');
      return logs.filter((l: any) => Object.keys(query).every(key => l[key] === query[key])).length;
    },
    create: (data: any) => {
      const logs = readCollection('extraLogs');
      const newLog = { ...data, _id: Date.now().toString(), createdAt: new Date().toISOString() };
      logs.push(newLog);
      writeCollection('extraLogs', logs);
      return newLog;
    }
  }
};
