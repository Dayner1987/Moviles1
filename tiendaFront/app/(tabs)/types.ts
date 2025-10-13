// app/(tabs)/types.ts

export type TabsStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  ClientHome: undefined;
  EmployeeHome: undefined;
  AdminHome: undefined;

  UserConE: undefined;
  ManageProducts: undefined;
  Orders: undefined;
  Search: undefined;
  OrderStatus: undefined;

  NewProducts: undefined;
  NewUsers: undefined;
  EarNings: undefined;

  // nuevas para swipe
  PayClient: undefined;
  OrdersClient: undefined;
  UserCon: undefined;

  Company: undefined;
  CompanyInfo: undefined;
};

// Dummy export para que expo-router no genere warnings
const _dummy = () => null;
export default _dummy;
