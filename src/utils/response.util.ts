import { ApiLogs } from './api-logs';

export class ResponseCall{
    private apiinstance = new ApiLogs();
    /**
     * @param req 
     * @param res
     * @param next
     */
    public responses(status_code:any, message:string, error:string, api_name:string, req, res){
        if(status_code == 200){
            this.apiinstance.log(status_code, message, api_name);
            return res.status(status_code).send({status_code, message});
        }else{
            console.log(req,res);
            
            this.apiinstance.log(status_code, error, api_name);
            res.status(status_code).send({status_code, error, message});
        }
    }
}
