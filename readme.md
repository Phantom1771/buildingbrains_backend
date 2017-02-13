##API<br/>
###Users<br/>
###<br/>
>1. Signup: 
>> Route: http://0.0.0.0:0000/users/signup/ <br/>
>> HTTP Verb: POST <br/>
>> JSON Req: {email:"xxx@xxx", password:"xxx", firstname:"xxx", lastname:"xxx"} <br/>
>> JSON Res: {result: 0/1, error:"xxx", userToken:"xxx"} <br/>

>2. Login: 
>> Route: http://0.0.0.0:0000/users/login/ <br/>
>> HTTP Verb: POST <br/>
>> JSON Req: {email:"xxx@xxx", password:"xxx"} <br/>
>> JSON Res: {result: 0/1, error:"xxx", userToken: "xxx"} <br/>

>3. Logout: 
>> Route: http://0.0.0.0:0000/users/logout <br/>
>> HTTP Verb: POST <br/>
>> JSON req: {userToken: "xxx"}<br/>
>> JSON res: {result: 0/1, error:"xxx"}<br/>

>4. Forgot password: <br/>
>> Route: http://0.0.0.0:0000/users/forgot <br/>
>> HTTP Verb: POST <br/>
>> JSON req: {email: "xxx@xxx"}<br/>
>> JSON res: {result: 0/1}<br/>

>5. Validate Reset Token: <br/>
>> Route: http://0.0.0.0:0000/users/reset <br/>
>> HTTP Verb: POST <br/>
>> JSON req: {token: "xxx"}<br/>
>> JSON res: {result: 0/1, error: "xxx", passwordResetToken: "xxx"}<br/>

>5. Reset password: <br/>
>> Route: http://0.0.0.0:0000/users/reset <br/>
>> HTTP Verb: POST <br/>
>> JSON req: {email: "xxx@xxx", password: "xxx", token: "xxx"}<br/>
>> JSON res: {result: 0/1, error: "xxx", userToken: "xxx"}<br/>

>6. Contact Us: <br/>
>> Route: http://0.0.0.0:0000/contact <br/>
>> HTTP Verb: POST <br/>
>> JSON req: {name: "xxx", email: "xxx@xxx", message: "xxx"}<br/>
>> JSON res: {result: 0/1, error: "xxx"}<br/>

>7. Account - returns account info: <br/>
>> Route: http://0.0.0.0:0000/users/account <br/>
>> HTTP Verb: GET <br/>
>> JSON req: {userToken: "xxx"}<br/>
>> JSON res: {firstName: "xxx", lastName: "xxx", email: "xxx@xxx", password: "xxx", hubs:[hub]}<r>

>8. Update Account info: <br/>
>> Route: http://0.0.0.0:0000/users/account/profile <br/>
>> HTTP Verb: POST <br/>
>> JSON req: {firstName: "xxx", lastName: "xxx", userToken: "xxx"}<br/>
>> JSON res: {result: 0/1, error: "xxx"}<br/>

>9. Update Password: <br/>
>> Route: http://0.0.0.0:0000/users/account/password <br/>
>> HTTP Verb: POST <br/>
>> JSON req: {password: "xxx", userToken: "xxx"}<br/>
>> JSON res: {result: 0/1, error: "xxx"}<br/>

>10. Delete Account: <br/>
>> Route: http://0.0.0.0:0000/users/account/delete <br/>
>> HTTP Verb: POST <br/>
>> JSON req: {userToken: "xxx"}<br/>
>> JSON res: {result: 0/1, error: "xxx"}<br/>

## Security middle ware <br/>
> lusca: https://github.com/krakenjs/lusca <br/>
> passport-json: https://www.npmjs.com/package/passport-json <br/>
