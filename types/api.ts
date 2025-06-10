export interface SalesData {
  district_name: string;
  quarter: string;
  industries: {
    [key: string]: {
      industry_name: string;
      sales_analysis: {
        daily_sales: {
          data: { [day: string]: number };
        };
        time_based_sales: {
          data: { [time: string]: number };
        };
        weekday_weekend: {
          weekday: number;
          weekend: number;
        };
        demographics: {
          gender: {
            male: number;
            female: number;
          };
          age: {
            [age: string]: number;
          };
        };
      };
    };
  };
}

export interface RestaurantResponse {
  items: Array<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }>;
}

export interface DistrictResponse {
  result: Array<{
    tot_ppltn: number | 'N/A';
    employee_cnt: number | 'N/A';
    tot_house: number | 'N/A';
    tot_family: number | 'N/A';
    income?: number | 'N/A';
    consumption?: number | 'N/A';
  }>;
}

export interface MoneyResponse {
  body: string;
  monthly_income: number;
  expenditure: {
    food_dining: number;
  };
} 