/**
 * @author Quentin Rasidy Mamba <qrasidym@cisco.com>
 * 
 * This macro will spawn a button with ID save_settings_in_memory, then deactivate itself.
 * The second macro that comes with this one : "reapply_settings_after_call" will listen on the button 
 * save_settings_in_memory. 
 * Once pushed, it will store some settings in the memory of the device, and reapply them when a call ends. 
 * See the reapply_settings_after_call macro for more details on its behaviour.
*/

import xapi from 'xapi';

let widgetXML = `<Extensions>
  <Version>1.11</Version>
  <Panel>
    <PanelId>save_settings_in_memory</PanelId>
    <Origin>local</Origin>
    <Location>ControlPanel</Location>
    <Icon>Sliders</Icon>
    <Name>Save Settings</Name>
    <ActivityType>Custom</ActivityType>
  </Panel>
</Extensions>
`
async function main(){
    await create_button_and_deactivate_macro()
}
async function create_button_and_deactivate_macro(){
    try{
        await xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: 'save_settings_in_memory' }, widgetXML)
        let this_macro_name = module.name.split('.').join('');
        // Remove backslashes
        this_macro_name = this_macro_name.split('\/').join('');

        await xapi.Command.Macros.Macro.Deactivate({ Name: this_macro_name });
    }catch(error){
        console.error('error initiating the macro')
        console.error(error)
    }
}

main()