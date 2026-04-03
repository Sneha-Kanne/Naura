import dbConnect from "@/src/lib/db";
import Config from "@/src/models/Config";

export async function ensureConfig(userId: string) {
  await dbConnect();
  const config = await Config.findOne({ userId });
  if (!config) {
    await Config.create({ userId, auraScore: 0 });
    console.log(`Initialized Config for user ${userId} with auraScore: 0`);
  }
}

export async function updateAuraScore(userId: string, points: number) {
  await dbConnect();
  await ensureConfig(userId);
  const config = await Config.findOneAndUpdate(
    { userId },
    { $inc: { auraScore: points } },
    { new: true }
  );
  return config ? config.auraScore : 0;
}
