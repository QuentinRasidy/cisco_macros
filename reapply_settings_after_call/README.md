# Reapply audio/video settings after a call

## Context 
An administrator might want to have one fixed setup for a specific room. For instance, the admin could want to have frames always enable in a specific room, 
or the volume setup to a certain level. 

These kind of settings can be changed by any user, at any time. A user that would want to change the camera settings for a specific call/scenario is totally fine. 
However, it can be frustrating for certain user to find a room with each time a different setup.

For instance, a user might set the volume to 0, and the next user would not understand why he/she cannot hear anything during a call. 

These two macros have one objective: **Reapply the settings the admin has chosen everytime a call is hung up**

## How does it work

These two macros have one objective :
- Save a chosen setup (camera settings, audio settings, meeting zone, ...) in the device internal memory
- Reapply the saved settings when a call is hung up

❓ My Cisco device runs with Microsoft Teams Rooms OS. Does it work then ?

- This works both when your device is in pure roomOS mode or Microsoft Teams Rooms.

## Requirements
As these macros rely on the Memory Functions, you need to install the macro Memory_Functions.js first. 
You will find more details here : https://github.com/Bobby-McGonigle/Cisco-RoomDevice-Macro-Projects-Examples/tree/master/Macro%20Memory%20Storage

Just upload the Memory_Functions.js macro on your device and make sure the Memory_Functions.js macro is disabled.

### spawn_save_settings_button.js
This macro will spawn a button with ID "save_settings_in_memory", then deactivate itself.

### reapply_settings_after_call.js
This second macro listens on the previously created button "save_settings_in_memory". 

Once this button has been pushed, we will store the following elements in the memory of the device thanks to the Memory_Functions macro:
  - Camera mode (Frames, speaker track, best overview)
  - Noise removal mode
  - Speaker Volume
  - Meeting zone settings
  
When all the parameters are saved, **the button disappears**, so a random user cannot alter the saved configuration.

After that, every time a call is hung up, the macro will read through the saved settings and reapply them all.

### I am an admin and I want to change some settings, how do I do ? 
If an administrator wants to modify certain settings after the button has disappeared, let's say the meeting zone must change for instance. 
An admin would need to just re-enable the spawn_save_settings_button, modify the meeting zone as he/she wishes, and then 
click again on the save settings button. 

The new settings will be saved, the macro spawn_button will deactivate.
 
### Feedbacks
Don't hesitate to give feedbacks at qrasidym@cisco.com, if you have ideas on how to improve these macros, or if you want additional settings to be saved.