const jsxapi = require('jsxapi');

let username=''
let password =''
let url = ''
let user='User1'
let ip = ''

process.argv.forEach(function (val, index, array) {
    if(index == 5){
        url = val
    }else if (index==6){
        user = val
    }else if (index==3){
        username = val
    }else if(index==4){
        password =val
    }else if (index==2){
        ip = val
    }
  });
  
try{
    jsxapi
  .connect('wss://'+ip, {
    username: username,
    password: password,
  })

  .on('error', console.error)
  .on('ready', async (xapi) => {
    let response = await xapi.Command.Cameras.Background.Fetch(
        { Image: user, Url: url });
        console.log(response)
    xapi.close();
  });
}catch(error){
    console.log(error)
}
