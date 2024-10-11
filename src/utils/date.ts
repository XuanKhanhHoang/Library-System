export function addMonths(monthsToAdd: number): Date {
  let currentDate = new Date();
  let newMonth = currentDate.getMonth() + monthsToAdd;
  currentDate.setMonth(newMonth);

  return currentDate;
}
