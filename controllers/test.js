const dayjs = require("dayjs");
const WeekOfYear = require("dayjs/plugin/weekOfYear");
dayjs.extend(WeekOfYear);
// dayjs().day() => 4
console.log(dayjs().daysInMonth());
console.log(
  dayjs([3]).startOf("month").week(),
  dayjs([3]).startOf("month").day()
);
console.log(
  dayjs([dayjs().year(), 3, dayjs().daysInMonth()]).week(),
  dayjs([dayjs().year(), 3]).add(1, "month").startOf("month").week(),
  dayjs([dayjs().year(), 3]).add(1, "month").startOf("month").day() - 1
);
const startWeek = dayjs([3]).startOf("month").week();
const endWeek = dayjs([dayjs().year(), 3, dayjs().daysInMonth()]).week();
const day = dayjs(["2023", "3", "1"]);
console.log("day", day.week(), day.day());
// const calculateAttendence = (month, weekDefinition) => {
//   const startMonth = dayjs([month]).startOf("month").day();
//   const endMonth = dayjs([month]).add(1, "month").startOf("month").day() - 1;
//   const month = [];
//   weekDefinition.forEach((week) => {});
// };

const weekDefinition = [
  {
    sunday: false,
    monday: true,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    _id: "6412179f7ff6442915ae7c71",
  },
  {
    sunday: true,
    monday: true,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    _id: "6412179f7ff6442915ae7c72",
  },
  {
    sunday: false,
    monday: true,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    _id: "6412179f7ff6442915ae7c73",
  },
  {
    sunday: false,
    monday: true,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    _id: "6412179f7ff6442915ae7c74",
  },
  {
    sunday: false,
    monday: true,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    _id: "6412179f7ff6442915ae7c75",
  },
];
