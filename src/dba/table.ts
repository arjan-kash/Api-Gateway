/**
 * @file
 *
 * This is DB table file where define all the table Name.
 *
 * @author Nagender Pratap Chauhan  on 14/6/21.
 */


 export abstract class Table { 
    public static readonly tbl_Customer = 'customer';  //  Nagender Pratap Chauhan
    public static readonly tbl_Holiday = 'holiday';  //  Nagender Pratap Chauhan
    public static readonly tbl_Extension_Master = 'extension_master';  //  Nagender Pratap Chauhan
    public static readonly tbl_Contact_List = 'pbx_contact_list';  //  Nagender Pratap Chauhan
    public static readonly tbl_SoftPhone_Logs = 'pbx_softphone_logs';  //  Nagender Pratap Chauhan
    public static readonly tbl_Register_Extension_Location = 'location';  //  Nagender Pratap Chauhan
    public static readonly tbl_Api_Logs = 'api_logs';  //  Nagender Pratap Chauhan
    public static readonly tbl_Recording = 'pbx_recording';  //  Nagender Pratap Chauhan
    public static readonly tbl_Voicemail_Recording = 'pbx_voicemail_recording';  //  Nagender Pratap Chauhan
    public static readonly tbl_Realtime_CDR = 'pbx_realtime_cdr';  //  Nagender Pratap Chauhan

    public static readonly tbl_Country = 'country';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Provider = 'providers';  //  Nagender Pratap Chauhan 
    public static readonly tbl_DID = 'did';  //  Nagender Pratap Chauhan    
    public static readonly tbl_Charge = 'charge';  //  Nagender Pratap Chauhan    
    public static readonly tbl_Uses = 'did_uses';  //  Nagender Pratap Chauhan    
    public static readonly tbl_IVR = 'pbx_ivr';  //  Nagender Pratap Chauhan    
    public static readonly tbl_RG = 'pbx_ring_group';  //  Nagender Pratap Chauhan    
    public static readonly tbl_Queue = 'pbx_queue';  //  Nagender Pratap Chauhan    
    public static readonly tbl_Conference = 'pbx_conference';  //  Nagender Pratap Chauhan    
    public static readonly tbl_DID_Destination = 'did_destination';  //  Nagender Pratap Chauhan    
    public static readonly tbl_DID_active_feature = 'active_feature';  //  Nagender Pratap Chauhan    
    public static readonly tbl_Ivr_Master = 'pbx_ivr_master';  //  Nagender Pratap Chauhan    
    public static readonly tbl_CALLGROUP = 'pbx_callgroup';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Time_Group = 'time_group';  //  Nagender Pratap Chauhan 
    public static readonly tbl_TC = 'pbx_tc';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Broadcast = 'pbx_broadcast';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Prompt = 'pbx_prompts';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Appointment = 'pbx_appointment';  //  Nagender Pratap Chauhan 
    public static readonly tbl_circle = 'pbx_circle';  //  Nagender Pratap Chauhan 
    public static readonly tbl_SMS = 'pbx_sms';  //  Nagender Pratap Chauhan 
    public static readonly tbl_SMS_API = 'pbx_sms_api';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Call_Plan = 'pbx_call_plan';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Call_Plan_Rates = 'pbx_call_plan_rates';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Gateway = 'gateway';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Features = 'pbx_feature';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Feature_Plan = 'pbx_feature_plan';
    public static readonly tbl_Package = 'package';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Call_Rate_Group = 'pbx_call_rate_group'; // Yash kashyap
    public static readonly tbl_Dialout_rule = 'pbx_dialout_rule'; // Yash kashyap

    public static readonly tbl_Map_Customer_Package = 'map_customer_package';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Gateway_Group = 'gateway_group';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Bundle_Plan = 'pbx_bundle_plan';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Email_template = 'email_template';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Email_Category = 'email_category';  //  Nagender Pratap Chauhan 
    public static readonly tbl_TimeZone = 'timezone';  //  Nagender Pratap Chauhan 
    public static readonly tbl_States = 'indian_states';  //  Nagender Pratap Chauhan 
    public static readonly tbl_Dialout_Group = 'pbx_dialout_group'; // nagender
    public static readonly tbl_Product = 'product'; // nagender
    public static readonly tbl_Codec = 'codec'; // Yash kKashyap

  }