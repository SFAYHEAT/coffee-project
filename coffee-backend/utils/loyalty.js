function getTier(points) {
  if (points >= 1000) return "Platinum";
  if (points >= 500) return "Gold";
  if (points >= 150) return "Silver";
  return "Bronze";
}

function checkBadges(user) {
  const badges = new Set(user.badges);
  if (user.visitStreak >= 3) badges.add("3-Day Streak");
  if (user.visitStreak >= 7) badges.add("7-Day Streak");
  if (user.loyaltyPoints >= 100) badges.add("Century Club");
  if (user.tier === "Gold") badges.add("Gold Member");
  if (user.tier === "Platinum") badges.add("Platinum Member");
  return Array.from(badges);
}

module.exports = { getTier, checkBadges };