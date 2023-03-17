const dayjs = require("dayjs");
const WeekOfYear = require("dayjs/plugin/weekOfYear");
const IsoWeek = require("dayjs/plugin/isoWeek");
const Duration = require("dayjs/plugin/duration");
dayjs.extend(Duration);
dayjs.extend(WeekOfYear);
dayjs.extend(IsoWeek);

// console.log(dayjs([2023, 2]).week());
// console.log(dayjs([2023, 2, 5]).get("D"));

// console.log(
//   dayjs([2023, 2])
//     .add(dayjs([2023, 2]).utcOffset(), "minutes")
//     .toISOString()
// );

console.log(dayjs().toISOString());
console.log(dayjs().add(dayjs().utcOffset(), "minutes").toISOString());

// 2 hour 1:30 hour

const calculateMonth = (month, year, weekDefinition, attendence) => {
  const startMonth = dayjs([year, month]);
  const userMonth = [];
  for (let i = 1; i <= startMonth.daysInMonth(); i++) {
    const presentDay = dayjs([year, month, i]);
    const presentWeek = presentDay.week() - startMonth.week();
    const weekDay = presentDay.day();
    userMonth.push({
      holiday:
        weekDefinition[presentWeek][presentDay.format("dddd").toLowerCase()],
      day: presentDay.toISOString(),
    });
  }
  return userMonth;
};

// console.log(calculateMonth(2, 2023, weekDefinition));
