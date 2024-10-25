import xapi from 'xapi';

const teams_webhook = ''

async function send_teams_message(adaptive_card){
  xapi.Command.HttpClient.Post(
      {  Header: 'Content-Type: application/json', Url: teams_webhook },JSON.stringify(adaptive_card)); 
}

let adaptive_card = {
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": {
        "type": "AdaptiveCard",
        "body": [
            
        ] ,
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.4"
      }
    }
  ]
}

//Uncomment the below line to actually send the message:)
//send_teams_message(adaptive_card)

