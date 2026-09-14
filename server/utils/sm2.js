// SM-2 spaced-repetition state transition (pure, DB-free).
//
// This is intentionally a simplified SM-2 variant: a correct answer nudges the
// ease factor up by 0.1, a wrong answer down by 0.2, with a 1.3 floor, and the
// review interval grows by the ease factor after the first two reviews.
//
// The inputs come straight off a Sequelize row, and `easeFactor` is a
// DECIMAL(3,2) column — Sequelize returns DECIMAL as a *string*. Doing
// `easeFactor + 0.1` on a string silently concatenates ("2.50" + 0.1 ->
// "2.50.1"), and Math.max(1.3, "2.50.1") is NaN, which then poisons every later
// review. So coerce all three inputs to numbers first, and heal any row that a
// previous run may already have corrupted to NaN/null.
export function computeSm2({ easeFactor, interval, repetitions, isCorrect }) {
  let ef = Number(easeFactor);
  let ivl = Number(interval);
  let reps = Number(repetitions);
  if (!Number.isFinite(ef)) ef = 2.5; // SM-2 default ease factor
  if (!Number.isFinite(ivl)) ivl = 0;
  if (!Number.isFinite(reps)) reps = 0;

  if (isCorrect) {
    reps += 1;
    if (reps === 1) {
      ivl = 1;
    } else if (reps === 2) {
      ivl = 6;
    } else {
      ivl = Math.round(ivl * ef);
    }
    ef = Math.max(1.3, ef + 0.1);
  } else {
    reps = 0;
    ivl = 1;
    ef = Math.max(1.3, ef - 0.2);
  }

  // Keep the ease factor at the column's precision (DECIMAL(3,2)) so repeated
  // updates don't accumulate binary-float drift (e.g. 2.7000000000000002).
  ef = Math.round(ef * 100) / 100;

  return { easeFactor: ef, interval: ivl, repetitions: reps };
}
