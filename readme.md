##API<br/>
###Frontend<br/>

###<br/>
>1. Signup: 
>> Route: http://0.0.0.0:0000/users/signup/ <br/>
>> HTTP Verb: POST <br/>
>> JSON Req: { email:"xxx@xxx", password:"xxx", firstname:"xxx", lastname:"xxx"} <br/>
>> JSON Res: { result: 0/1, error:"xxx"} <br/>

>2. Login: 
>> Route: http://0.0.0.0:0000/users/login/ <br/>
>> HTTP Verb: POST <br/>
>> JSON Req: { email:"xxx@xxx", password:"xxx"} <br/>
>> JSON Res: { result: 0/1, error:"xxx"} <br/>

>3. Logout: 
>> Route: http://0.0.0.0:0000/users/logout <br/>
>> HTTP Verb: GET <br/>
>> JSON req: {}<br/>
>> JSON res: {}<br/>

>4. Forgot password: <br/>
>> Route: http://0.0.0.0:0000/users/forgot <br/>
>> HTTP Verb: POST <br/>
>> JSON req: {}<br/>
>> JSON res: {}<br/>

>5. Reset password: <br/>
>> Route: http://0.0.0.0:0000/users/reset/:token <br/>
>> HTTP Verb: POST <br/>
>> JSON req: {}<br/>
>> JSON res: {}<br/>

>6. Contact Us: <br/>
>> Route: http://0.0.0.0:0000/contact <br/>
>> HTTP Verb: POST <br/>
>> JSON req: {}<br/>
>> JSON res: {}<br/>

>7. Account - returns account info: <br/>
>> Route: http://0.0.0.0:0000/users/account <br/>
>> HTTP Verb: GET <br/>
>> JSON req: {}<br/>
>> JSON res: {}<br/>

>8. Update Account info: <br/>
>> Route: http://0.0.0.0:0000/users/account/profile <br/>
>> HTTP Verb: POST <br/>
>> JSON req: {}<br/>
>> JSON res: {}<br/>

>9. Update Password: <br/>
>> Route: http://0.0.0.0:0000/users/account/password <br/>
>> HTTP Verb: POST <br/>
>> JSON req: {}<br/>
>> JSON res: {}<br/>

>10. Delete Account: <br/>
>> Route: http://0.0.0.0:0000/users/account/delete <br/>
>> HTTP Verb: POST <br/>
>> JSON req: {}<br/>
>> JSON res: {}<br/>

###Hub<br/>
