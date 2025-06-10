export function formatValue(key: string, value: number): string {
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '만';
    }
    return num.toLocaleString('ko-KR');
  };

  switch (key) {
    case 'tot_ppltn':
    case 'employee_cnt':
    case 'tot_family':
      return formatNumber(value) + '명';
    case 'tot_house':
      return formatNumber(value) + '세대';
    case 'income':
      return formatNumber(value) + '원';
    case 'consumption':
      // 소비는 값이 매우 크므로 억 단위로 표시
      return (value / 100000000).toFixed(1) + '억원';
    default:
      return formatNumber(value);
  }
}