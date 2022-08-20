/**
 * @file
 *
 * This is Constant table file where define all the constant Name.
 *
 * @author Nagender Pratap Chauhan  on 28/02/22.
 */


 export abstract class UserTypeConstants {
    public static readonly ADMIN = '0';
    public static readonly CUSTOMER = '1';
    public static readonly SUB_ADMIN = '2';
    public static readonly RESELLER = '3';
    public static readonly ACCOUNT_MANAGER = '4';
    public static readonly SUPPORT_MANAGER = '5';
    public static readonly EXTENSION = '6';
  }

  export abstract class MinutePlanTypeConstants {
    public static readonly STANDARD = '0';
    public static readonly BUNDLE = '1';
    public static readonly ROAMING = '2';
    public static readonly BOOSTER = '3';
    public static readonly TELECONSULTANCY = '4';

  }  