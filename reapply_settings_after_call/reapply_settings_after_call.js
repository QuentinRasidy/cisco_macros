/**
 * @author Quentin Rasidy Mamba <qrasidym@cisco.com>
 * //This script is simple:
 * It listens to the push of the button with ID "save_settings_in_memory"
 * This button is created by a second macro named "spawn_save_settings_button"
 * After the button has been created, the macro "spawn_save_settings_button deactivates itself" 
 * 
 * Once this button has been pushed, we will store the following elements in the memory of the device thanks to 
 * the Memory_Functions macro:
 * - Camera mode (Frames, speaker track, best overview)
 * - Noise removal mode
 * - Speaker Volume
 * - Meeting zone settings
 * 
 * When all the parameters are saved, the button disappears, so a random user cannot alter the saved configuration.
 * 
 * After that, every time a call is hung up, the macro will read through the saved settings and reapply them all.
 * 
 * If an administrator wants to modify certain settings afterwards, let's say the meeting zone must change for instance. 
 * An admin would need to just re-enable the spawn_save_settings_button, modify the meeting zone as he/she wishes, and then 
 * click again on the save settings button. The new settings will be saved, the macro spawn_button will deactivate.
 * 
 * There are a few variables that you can change below to tune the behaviour of this macro
*/

import xapi from 'xapi';
import { mem } from './Memory_Functions'; mem.localScript = module.name;


const treat_mtr=true //Is your device an MTR and do you want to treat Microsoft Calls.

const treat_roomos=true //Wether your device is MTR or not, do you also want to reapply saved settings after a regular SIP/WEbex call ?

const treat_camera_settings=true //Do you want to reapply the saved camera settings ?
const treat_meeting_zone=true //Do you want to reapply the saved meeting zone settings ?
const treat_audio_settings=true //Do you want to reapply the saved audio settings ?

/*
MEMORY ACCESS FUNCTIONS
====================
====================
*/
async function save_camera_settings_in_memory(camera_settings){
  console.log('writing camera settings in memory')
  try{
    await mem.write('camera_settings', camera_settings)
  }catch(error){
    console.error('Could not save camera settings in memory')
    throw(error)
  } 
}
async function save_meeting_zone_settings_in_memory(meeting_zone_settings){
  console.log('writing meeting zone settings in memory')
  try{
    await mem.write('meeting_zone_settings', meeting_zone_settings)
  }catch(error){
    console.error('Could not save meeting zone settings in memory')
    throw(error)
  } 
}
async function read_camera_settings_in_memory(){
  try{
    let camera_settings = await mem.read('camera_settings')
    return camera_settings
  }catch(error){
    console.error('there was an error retrieving the camera settings in the memory')
    throw(error)
  }
}

async function save_audio_settings_in_memory(audio_settings){
  console.log('writing audio settings in memory')
  try{
    await mem.write('audio_settings', audio_settings)
  }catch(error){
    console.error('Could not save audio settings in memory')
    throw(error)
  }
}
async function read_audio_settings_in_memory(){
  try{
    let audio_settings = await mem.read('audio_settings')
    return audio_settings
  }catch(error){
    console.error('there was an error retrieving the audio settings in the memory')
    throw(error)
  }
}
async function read_meeting_zone_settings_in_memory(){
  try{
    let meeting_zone_settings = await mem.read('meeting_zone_settings')
    return meeting_zone_settings
  }catch(error){
    console.error('there was an error retrieving the meeting_zone settings in the memory')
    throw(error)
  }
}


/*
END MEMORY ACCESS FUNCTIONS
====================
====================
*/

/*
CAMERA FUNCTIONS
====================
====================
*/
async function activate_speaker_track(){
    try{
        await xapi.Command.Cameras.SpeakerTrack.Activate();
        await xapi.Command.Cameras.SpeakerTrack.Frames.Deactivate();
        return xapi.Command.Cameras.SpeakerTrack.Closeup.Activate();
    }catch(error){
        throw(error)
    }
}
async function activate_best_overview(){
    try{
        await xapi.Command.Cameras.SpeakerTrack.Frames.Deactivate();
        await xapi.Command.Cameras.SpeakerTrack.Closeup.Deactivate();
        return xapi.Command.Cameras.SpeakerTrack.Activate();
    }catch(error){
        throw(error)
    }
}
async function activate_framing(){
    try{
        await xapi.Command.Cameras.SpeakerTrack.Activate();
        await xapi.Command.Cameras.SpeakerTrack.Closeup.Deactivate();
        return xapi.Command.Cameras.SpeakerTrack.Frames.Activate();
    }catch(error){
        throw(error)
    } 
}

async function reapply_camera_settings(camera_settings){
  try{
      if(!camera_settings.manual){
        if(camera_settings.speakerTrack)
            await activate_speaker_track()
        else if (camera_settings.frames)
            await activate_framing()
        else if (camera_settings.bestOverview)
            await activate_best_overview()
    }
  }catch(error){
    console.error('could not reapply camera settings properly')
    throw(error)
  } 
}

async function reapply_meeting_zone_settings(meeting_zone_settings){
  try{
    if(meeting_zone_settings.active){
      await xapi.Config.Cameras.SpeakerTrack.MeetingZone.Area.set(meeting_zone_settings.coordinates);
      await xapi.Config.Cameras.SpeakerTrack.MeetingZone.Mode.set("Auto");
    }
  }catch(error){
    console.error('could not reapply meeting zone settings')
    throw(error)
  }
}

async function get_camera_settings(){

    //The following object will be saved in memory.
    //We initiate it with all parameters to false, we read through all parameters and set them to true when necessary
  let cameraStatus={
    "manual":false,
    "speakerTrack":false,
    "frames":false,
    "bestOverview":false,
    "position":{},
    "id":0
  }

  const cameraMode = await xapi.Status.Cameras.SpeakerTrack.get()
  
  if(cameraMode.Closeup.Status == 'Active'){
    cameraStatus.speakerTrack = true
  }else if(cameraMode.Frames.Status =='Active'){
    cameraStatus.frames = true
  }else if(cameraMode.State =='BestOverview'){
    cameraStatus.bestOverview = true
  }
  else if(cameraMode.State =='Off'){
    //In this case, the main camera is set to a manual angle.
    cameraStatus.manual = true
    let position = {}
    let id = 0
    const cameras = await xapi.Status.Cameras.get()
    for(let i=0;i<cameras.Camera.length;i++){
      let camera = cameras.Camera[i]
      //We will only save the integrated camera for now
      if(camera.Model =='Integrated Camera'){
        id = camera.id
        position = {
          'Pan':camera.Position.Pan,
          'Tilt':camera.Position.Tilt,
          'Zoom':camera.Position.Zoom
        }
        cameraStatus.id = id
        cameraStatus.position = position
      }
    }
    
  }  
  return cameraStatus
}

async function get_meeting_zone_settings(){
  let meeting_zone_settings = {
    "active":false,
    "coordinates":[]
  }
  try{
    let value = await xapi.Config.Cameras.SpeakerTrack.MeetingZone.Mode.get()
    if(value == "Auto"){
      //when this value is Auto, it means there is an active meeting zone
      let coordinates = await xapi.Config.Cameras.SpeakerTrack.MeetingZone.Area.get()
      meeting_zone_settings.active = true
      meeting_zone_settings.coordinates = coordinates
    }
  }catch(error){
    console.error('could not retrieve meeting zone status')
    throw(error)
  }
  return meeting_zone_settings
}
/*
END CAMERA FUNCTIONS
====================
====================
*/

/*
AUDIO FUNCTIONS
====================
====================
*/
async function get_audio_settings(){
  try{
    let volume = await xapi.Status.Audio.Volume.get()
    
    let noiseRemovalMode = await xapi.Config.Audio.Microphones.NoiseRemoval.Mode.get()

    let audio_settings = {
        "default_volume":volume,
        "noise_removal_mode":noiseRemovalMode
      }

    return audio_settings
  }catch(error){
    console.error('error reading audio settings')
  }
}
async function reapply_audio_settings(audio_settings){
    try{
        await xapi.Command.Audio.Volume.Set({ Level: audio_settings.default_volume });
        await xapi.Config.Audio.Microphones.NoiseRemoval.Mode.set(audio_settings.noiseRemovalMode);
    }catch(error){
        console.error('command xapi.Command.Audio.Volume.Set failed')
        throw(error)
    }
  
}
/*
END AUDIO FUNCTIONS
====================
====================
*/


/** save_all_settings
 * This function read through the settings and save them in the device memory thanks to the Memory_Functions macro.
 */
async function save_all_settings(){
  try{
    let camera_settings = await get_camera_settings()
    await save_camera_settings_in_memory(camera_settings)
    console.log('camera settings saved')
  }catch(error){
    console.error('could not retrieve and save camera settings')
  }
  try{
    let audio_settings = await get_audio_settings()
    await save_audio_settings_in_memory(audio_settings)
    console.log('audio settings saved')
  }catch(error){
    console.error('could not retrieve and save audio settings')
  }
  try{
    let meeting_zone_settings = await get_meeting_zone_settings()
    await save_meeting_zone_settings_in_memory(meeting_zone_settings)
    console.log('meeting zone settings saved')
  }catch(error){
    console.error('could not retrieve and save meeting zone settings')
  }

  try{
    //Now that the settings are properly saved, we will delete the button save_settings_in_memory so that users won't use it (only admin will, be reactivating the other macro that spawns that button)
    await xapi.Command.UserInterface.Extensions.Panel.Remove({ PanelId: "save_settings_in_memory" });
    xapi.Command.UserInterface.Message.Alert.Display(
        { Duration: 5, Text: "Settings saved successfully, they will be reapply after a call", Title: "Settings saved" });
  }catch(error){
    console.error('Could not delete button after saving settings')
  }
}

/** reapply_settings
 * This function read through all saved settings and attemps to reapply them all.
 */
async function reapply_settings(){

  if(treat_camera_settings){
    try{
        let camera_settings = await read_camera_settings_in_memory()
        try{
          await reapply_camera_settings(camera_settings)
          console.log('camera settings were reapplied properly')
        }catch(error){
          console.error('Could not reapply camera settings properly')
        }
      }catch(error){
        console.error('could not read camera settings, we wont be able to reapply  saved camera settings')
        console.error(error)
      }
  }
  
  if(treat_audio_settings){
    //Reapply audio settings
    try{
        let audio_settings = await read_audio_settings_in_memory()
        try{
        await reapply_audio_settings(audio_settings)
        console.log('audio settings were reapplied properly')
        }catch(error){
        console.error('Could not re apply audio settings properly')
        }
    }catch(error){
        console.error('could not read audio settings, we wont be able to reapply saved audio settings')
    }
  }

  if(treat_meeting_zone){
    try{
        let meeting_zone_settings = await read_meeting_zone_settings_in_memory()
        try{
          reapply_meeting_zone_settings(meeting_zone_settings)
          console.log('meeting zone settings were reapplied properly')
        }catch(error){
          console.error('could not reapply meeting zone settings')
        }
      }catch(error){
        console.error('could not read meeting zone settings, we wont be able to reapply these settings')
      }
  }
}

//When a microsoft teams call is hangup, we use the reapply_settings function reapply all saved settings
if(treat_mtr){
    xapi.Status.MicrosoftTeams.Calling.InCall.on(handleNewCallingStatus)
    async function handleNewCallingStatus(status){
        if(status == 'False'){
          reapply_settings()
        }
    }
}

//When a regular SIP call / webex call is hung up, we will also call the reapply_settings function.
if(treat_roomos){
    xapi.Event.CallDisconnect.on(reapply_settings);
}

//If the "Save Settings" button is clicked, we call the function save_all_settings()
xapi.Event.UserInterface.Extensions.Panel.Clicked.on(event => {
    switch (event.PanelId) {
      case 'save_settings_in_memory':
        save_all_settings()
        break;
    }
})
