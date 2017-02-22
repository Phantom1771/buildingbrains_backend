##API<br/>
###Users<br/>
1. Signup:
> Route: http://0.0.0.0:0000/users/signup/ <br/>
> HTTP Verb: POST <br/>
> JSON Req: {email:"xxx@xxx", password:"xxx", firstname:"xxx", lastname:"xxx"} <br/>
> JSON Res: {result: 0/1, error:"xxx", userToken:"xxx"} <br/>

2. Login:
> Route: http://0.0.0.0:0000/users/login/ <br/>
> HTTP Verb: POST <br/>
> JSON Req: {email:"xxx@xxx", password:"xxx"} <br/>
> JSON Res: {result: 0/1, error:"xxx", userToken: "xxx"} <br/>

3. Logout:
> Route: http://0.0.0.0:0000/users/logout <br/>
> HTTP Verb: POST <br/>
> Authentication: Auth Header
> JSON req: {}<br/>
> JSON res: {result: 0/1, error:"xxx"}<br/>

4. Forgot password: <br/>
> Route: http://0.0.0.0:0000/users/forgot <br/>
> HTTP Verb: POST <br/>
> JSON req: {email: "xxx@xxx"}<br/>
> JSON res: {result: 0/1}<br/>

5. Reset password: <br/>
> Route: http://0.0.0.0:0000/users/reset <br/>
> HTTP Verb: POST <br/>
> JSON req: {email: "xxx@xxx", password: "xxx", token: "xxx"}<br/>
> JSON res: {result: 0/1, error: "xxx", userToken: "xxx"}<br/>

6. Account - returns account info: <br/>
> Route: http://0.0.0.0:0000/users/account <br/>
> HTTP Verb: GET <br/>
> Authentication: Auth Header
> JSON res: {firstName: "xxx", lastName: "xxx", email: "xxx@xxx", password: "xxx", hubs:[hub]}<r>

7. Update Account info: <br/>
> Route: http://0.0.0.0:0000/users/account/profile <br/>
> HTTP Verb: POST <br/>
> Authentication: Auth Header
> JSON req: {firstName: "xxx", lastName: "xxx"}<br/>
> JSON res: {result: 0/1, error: "xxx"}<br/>

8. Update Password: <br/>
> Route: http://0.0.0.0:0000/users/account/password <br/>
> HTTP Verb: POST <br/>
> Authentication: Auth Header
> JSON req: {password: "xxx"}<br/>
> JSON res: {result: 0/1, error: "xxx"}<br/>

9. Delete Account: <br/>
> Route: http://0.0.0.0:0000/users/account/delete <br/>
> HTTP Verb: POST <br/>
> Authentication: Auth Header
> JSON req: {}<br/>
> JSON res: {result: 0/1, error: "xxx"}<br/>

###Contact Us<br/>
1. Contact Us: <br/>
> Route: http://0.0.0.0:0000/contact <br/>
> HTTP Verb: POST <br/>
> JSON req: {name: "xxx", email: "xxx@xxx", message: "xxx"}<br/>
> JSON res: {result: 0/1, error: "xxx"}<br/>

###Hubs<br/>
1. Add Hub:<br/>
> Route: http://0.0.0.0:0000/hubs/add <br/>
> HTTP Verb: POST <br/>
> Authentication: Auth Header
> JSON req: {hubCode: "xxx", hubName: "xxx"}<br/>
> JSON res: {result: 0/1, error: "xxx"}<br/>

2. Delete Hub:<br/>
> Route: http://0.0.0.0:0000/hubs/delete <br/>
> HTTP Verb: POST <br/>
> Authentication: Auth Header
> JSON req: {hubID: "xxx"}<br/>
> JSON res: {result: 0/1, error: "xxx"}<br/>

###Devices<br/>
1. Get Devices:<br/>
> Route: http://0.0.0.0:0000/devices/ <br/>
> HTTP Verb: GET <br/>
> Authentication: Auth Header
> JSON res: {result: 0/1, error: "xxx", devices: {device}}<br/>

2. Get Specific Device:<br/>
> Route: http://0.0.0.0:0000/devices/deviceID <br/>
> HTTP Verb: GET <br/>
> Authentication: Auth Header
> JSON res: {result: 0/1, error: "xxx", device: {device}}<br/>

3. Search Nearby Devices:<br/>
> Route: http://0.0.0.0:0000/devices/nearby <br/>
> HTTP Verb: GET <br/>
> Authentication: Auth Header
> JSON res: {result: 0/1, error: "xxx", devices: {device}}<br/>

4. Add Device and get/store status:<br/>
> Route: http://0.0.0.0:0000/devices/add <br/>
> HTTP Verb: POST <br/>
> Authentication: Auth Header
> JSON req: {hubID: "xxx", deviceLink: "xxx", deviceName: "xxx"}<br/>
> JSON res: {result: 0/1, error: "xxx"}<br/>

5. Update Device:<br/>
> Route: http://0.0.0.0:0000/devices/update <br/>
> HTTP Verb: POST <br/>
> Authentication: Auth Header
> JSON req: {hubID: "xxx", deviceID: "xxx", deviceSettings: {settings}}<br/>
> JSON res: {result: 0/1, error: "xxx"}<br/>

6. Delete Device:<br/>
> Route: http://0.0.0.0:0000/devices/delete <br/>
> HTTP Verb: POST <br/>
> Authentication: Auth Header
> JSON req: {hubID: "xxx", deviceID: "xxx"}<br/>
> JSON res: {result: 0/1, error: "xxx"}<br/>
