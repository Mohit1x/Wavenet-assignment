const getFinancialYear = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 4) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

const getFinancialYearDates = (financialYear) => {
  const [startYear, endYear] = financialYear.split("-").map(Number);
  const startDate = new Date(startYear, 3, 1);
  const endDate = new Date(endYear, 2, 31);
  return { startDate, endDate };
};

module.exports = { getFinancialYear, getFinancialYearDates };
