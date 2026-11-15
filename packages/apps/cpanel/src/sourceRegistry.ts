/**
 * Pinned legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187
 * webpack 3097 + a97a + a682 (cpanel root, routes and task search),
 * English labels from assets/locales/en-US.json. Items retain SOURCE ORDER.
 * The original source excludes program targets only if the source
 * testmode/c170 program manifest does not contain their ID.
 *
 * A registry entry is not an implemented application. Only six panel
 * destinations below have React screens; settings/program launchers remain
 * visibly disabled rather than invoking host-device operations.
 */
export type SourceCpanelTarget="panel"|"program"|"setting";
export interface SourceCpanelTask{
  readonly label:string;
  readonly keywords:string;
  readonly id:string;
}
export interface SourceCpanelRegistryItem{
  readonly id:string;
  readonly label:string;
  readonly category:string;
  readonly target:SourceCpanelTarget;
  readonly iconKey:string;
  readonly tasks:readonly SourceCpanelTask[];
}
export const SOURCE_CPANEL_REGISTRY:readonly SourceCpanelRegistryItem[]=
  Object.freeze([
  {
    "id": "data",
    "label": "Data Usage",
    "category": "network-internet",
    "target": "setting",
    "iconKey": "data",
    "tasks": [
      {
        "label": "View data usage",
        "keywords": "mobile cellular network internet traffic wifi",
        "id": "data"
      }
    ]
  },
  {
    "id": "datetime",
    "label": "Date and Time",
    "category": "clock-region",
    "target": "setting",
    "iconKey": "datetime",
    "tasks": [
      {
        "label": "Set the time and date",
        "keywords": "clock calendar",
        "id": "datetime"
      },
      {
        "label": "Change the time zone",
        "keywords": "clock timezone",
        "id": "datetime"
      },
      {
        "label": "Add clocks for different time zones",
        "keywords": "",
        "id": "datetime"
      }
    ]
  },
  {
    "id": "default",
    "label": "Default Programs",
    "category": "programs",
    "target": "setting",
    "iconKey": "default",
    "tasks": [
      {
        "label": "Set your default programs",
        "keywords": "applications apps associations open with",
        "id": "default"
      },
      {
        "label": "Make a file type always open in a specific program",
        "keywords": "associations extensions open with",
        "id": "default"
      }
    ]
  },
  {
    "id": "storage",
    "label": "Device Storage",
    "category": "system-security",
    "target": "setting",
    "iconKey": "storage",
    "tasks": [
      {
        "label": "Free up disk space",
        "keywords": "storage drive hard memory card clean",
        "id": "storage"
      }
    ]
  },
  {
    "id": "display",
    "label": "Display",
    "category": "appearance",
    "target": "panel",
    "iconKey": "display",
    "tasks": [
      {
        "label": "Make text and other items larger or smaller",
        "keywords": "font size dpi zoom scale magnify",
        "id": "display"
      },
      {
        "label": "Adjust screen resolution",
        "keywords": "display monitor size pixels",
        "id": "display"
      },
      {
        "label": "Adjust screen brightness",
        "keywords": "display monitor light dim",
        "id": "display"
      }
    ]
  },
  {
    "id": "action-center",
    "label": "Action Center",
    "category": "system-security",
    "target": "panel",
    "iconKey": "action-center-headline",
    "tasks": [
      {
        "label": "Review your computer's status and resolve issues",
        "keywords": "problems errors security maintenance repair",
        "id": "action-center"
      },
      {
        "label": "Change Action Center settings",
        "keywords": "messages notifications alerts",
        "id": "action-center"
      },
      {
        "label": "Troubleshoot common computer problems",
        "keywords": "fix repair errors",
        "id": "action-center"
      }
    ]
  },
  {
    "id": "backup",
    "label": "Backup and Restore",
    "category": "system-security",
    "target": "panel",
    "iconKey": "backup",
    "tasks": [
      {
        "label": "Back up your computer",
        "keywords": "backup save copy archive",
        "id": "backup"
      },
      {
        "label": "Restore data, files, or computers from backup",
        "keywords": "recover recovery backup",
        "id": "backup"
      }
    ]
  },
  {
    "id": "access",
    "label": "Ease of Access",
    "category": "ease-access",
    "target": "setting",
    "iconKey": "access",
    "tasks": [
      {
        "label": "Turn Magnifier on or off",
        "keywords": "zoom enlarge vision",
        "id": "access"
      },
      {
        "label": "Turn High Contrast on or off",
        "keywords": "colors vision",
        "id": "access"
      },
      {
        "label": "Use screen reader",
        "keywords": "narrator blind read aloud",
        "id": "access"
      }
    ]
  },
  {
    "id": "gadgets",
    "label": "Gadgets",
    "category": "appearance",
    "target": "program",
    "iconKey": "gadgets",
    "tasks": [
      {
        "label": "Add gadgets to the desktop",
        "keywords": "widgets sidebar",
        "id": "gadgets"
      },
      {
        "label": "Add the Clock gadget to the desktop",
        "keywords": "time widgets",
        "id": "gadgets"
      }
    ]
  },
  {
    "id": "keyboard",
    "label": "Keyboard",
    "category": "hardware-sound",
    "target": "setting",
    "iconKey": "keyboard",
    "tasks": [
      {
        "label": "Change cursor blink rate",
        "keywords": "keyboard typing",
        "id": "keyboard"
      },
      {
        "label": "Check keyboard status",
        "keywords": "typing input",
        "id": "keyboard"
      }
    ]
  },
  {
    "id": "mouse",
    "label": "Mouse",
    "category": "hardware-sound",
    "target": "program",
    "iconKey": "mouse",
    "tasks": [
      {
        "label": "Change mouse settings",
        "keywords": "pointer cursor buttons",
        "id": "mouse"
      },
      {
        "label": "Change mouse pointers",
        "keywords": "cursors arrows pointer schemes",
        "id": "mouse"
      },
      {
        "label": "Change mouse click settings",
        "keywords": "double-click buttons speed",
        "id": "mouse"
      },
      {
        "label": "Change mouse wheel settings",
        "keywords": "scrolling",
        "id": "mouse"
      },
      {
        "label": "Make it easier to see the mouse pointer",
        "keywords": "cursor size large visibility trails",
        "id": "mouse"
      },
      {
        "label": "Change touchpad settings",
        "keywords": "trackpad tap gestures mouse",
        "id": "mouse"
      }
    ]
  },
  {
    "id": "notification",
    "label": "Notification Area Icons",
    "category": "appearance",
    "target": "panel",
    "iconKey": "notification",
    "tasks": [
      {
        "label": "Customize icons on the taskbar",
        "keywords": "tray system notification area",
        "id": "notification"
      },
      {
        "label": "Show or hide volume (and other) icons on the taskbar",
        "keywords": "tray speaker clock network battery",
        "id": "notification"
      },
      {
        "label": "Turn system icons on or off",
        "keywords": "",
        "id": "notification"
      }
    ]
  },
  {
    "id": "personalize",
    "label": "Personalize",
    "category": "appearance",
    "target": "program",
    "iconKey": "personalize",
    "tasks": [
      {
        "label": "Change the theme",
        "keywords": "personalization appearance style look",
        "id": "personalize"
      },
      {
        "label": "Change desktop background",
        "keywords": "wallpaper picture image photo",
        "id": "personalize"
      },
      {
        "label": "Change window glass colors",
        "keywords": "color transparency borders appearance",
        "id": "personalize"
      },
      {
        "label": "Change screen saver",
        "keywords": "screensaver lock idle",
        "id": "personalize"
      },
      {
        "label": "Change sound effects",
        "keywords": "audio system sounds schemes",
        "id": "sound"
      },
      {
        "label": "Change mouse pointers",
        "keywords": "cursors arrows pointer schemes",
        "id": "mouse"
      }
    ]
  },
  {
    "id": "power",
    "label": "Power Options",
    "category": "system-security",
    "target": "setting",
    "iconKey": "power",
    "tasks": [
      {
        "label": "Choose a power plan",
        "keywords": "energy battery performance",
        "id": "power"
      },
      {
        "label": "Change battery settings",
        "keywords": "power saver laptop",
        "id": "power"
      },
      {
        "label": "Change when the computer sleeps",
        "keywords": "sleep hibernate standby timeout power",
        "id": "power"
      }
    ]
  },
  {
    "id": "programs",
    "label": "Programs and Features",
    "category": "programs",
    "target": "panel",
    "iconKey": "programs",
    "tasks": [
      {
        "label": "Uninstall a program",
        "keywords": "remove delete software applications apps",
        "id": "programs"
      },
      {
        "label": "View installed programs",
        "keywords": "software applications apps list",
        "id": "programs"
      }
    ]
  },
  {
    "id": "region",
    "label": "Region and Language",
    "category": "clock-region",
    "target": "program",
    "iconKey": "region",
    "tasks": [
      {
        "label": "Change date, time, or number format",
        "keywords": "region locale currency calendar",
        "id": "region"
      },
      {
        "label": "Change location",
        "keywords": "country region",
        "id": "region"
      },
      {
        "label": "Change keyboards or other input methods",
        "keywords": "language layout typing",
        "id": "region"
      },
      {
        "label": "Change display language",
        "keywords": "translation locale interface",
        "id": "region"
      }
    ]
  },
  {
    "id": "sound",
    "label": "Sounds",
    "category": "hardware-sound",
    "target": "program",
    "iconKey": "sound",
    "tasks": [
      {
        "label": "Adjust system volume",
        "keywords": "audio speakers mute loud quiet",
        "id": "sound"
      },
      {
        "label": "Change system sounds",
        "keywords": "audio effects schemes",
        "id": "sound"
      },
      {
        "label": "Manage audio devices",
        "keywords": "speakers headphones microphone playback recording",
        "id": "sound"
      }
    ]
  },
  {
    "id": "speech",
    "label": "Speech Recognition",
    "category": "ease-access",
    "target": "setting",
    "iconKey": "speech",
    "tasks": [
      {
        "label": "Start speech recognition",
        "keywords": "voice dictation talk",
        "id": "speech"
      },
      {
        "label": "Set up a microphone",
        "keywords": "mic voice recording",
        "id": "speech"
      }
    ]
  },
  {
    "id": "sync",
    "label": "Sync Center",
    "category": "network-internet",
    "target": "setting",
    "iconKey": "sync",
    "tasks": [
      {
        "label": "View sync partnerships",
        "keywords": "synchronize accounts offline files",
        "id": "sync"
      }
    ]
  },
  {
    "id": "system",
    "label": "System",
    "category": "system-security",
    "target": "program",
    "iconKey": "system",
    "tasks": [
      {
        "label": "View amount of RAM and processor speed",
        "keywords": "memory cpu hardware specifications",
        "id": "system"
      },
      {
        "label": "See the name of this computer",
        "keywords": "pc device hostname",
        "id": "system"
      },
      {
        "label": "Show which operating system your computer is running",
        "keywords": "version edition about",
        "id": "system"
      },
      {
        "label": "Check the Windows Experience Index",
        "keywords": "performance score rating speed",
        "id": "system"
      }
    ]
  },
  {
    "id": "taskbar",
    "label": "Taskbar and Start Menu",
    "category": "appearance",
    "target": "program",
    "iconKey": "taskbar",
    "tasks": [
      {
        "label": "Customize the Start menu",
        "keywords": "programs links",
        "id": "taskbar"
      },
      {
        "label": "Customize icons on the taskbar",
        "keywords": "tray system notification area",
        "id": "notification"
      },
      {
        "label": "Auto-hide the taskbar",
        "keywords": "autohide",
        "id": "taskbar"
      },
      {
        "label": "Lock or unlock the taskbar",
        "keywords": "",
        "id": "taskbar"
      }
    ]
  },
  {
    "id": "accounts",
    "label": "User Accounts",
    "category": "accounts",
    "target": "panel",
    "iconKey": "accounts",
    "tasks": [
      {
        "label": "Change your picture",
        "keywords": "account avatar user photo image",
        "id": "accounts"
      },
      {
        "label": "Change your password",
        "keywords": "account user login sign in security",
        "id": "accounts"
      },
      {
        "label": "Change your display name",
        "keywords": "account user rename username",
        "id": "accounts"
      },
      {
        "label": "Add or remove user accounts",
        "keywords": "users people login sign in",
        "id": "accounts"
      }
    ]
  },
  {
    "id": "defender",
    "label": "Windows Defender",
    "category": "system-security",
    "target": "setting",
    "iconKey": "defender",
    "tasks": [
      {
        "label": "Scan for spyware and other potentially unwanted software",
        "keywords": "virus malware antivirus security",
        "id": "defender"
      }
    ]
  },
  {
    "id": "update",
    "label": "Windows Update",
    "category": "system-security",
    "target": "setting",
    "iconKey": "update",
    "tasks": [
      {
        "label": "Check for updates",
        "keywords": "upgrade new version",
        "id": "update"
      }
    ]
  }
]);

const sourceNormalize=(text:string)=>text.normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase();
/** Source 5985 words may start after punctuation or spaces; do not match
 * arbitrary middle-of-word fragments. Matches localized names and task keys. */
function termStartsWord(text:string,term:string):boolean{
  let pos=text.indexOf(term);
  while(pos!==-1){
    if(pos===0||/[^\p{L}\p{N}]/u.test(text[pos-1]))return true;
    pos=text.indexOf(term,pos+1);
  }
  return false;
}
function scoreTextFields(fields:readonly {text:string;weight:number}[],terms:readonly string[]):number{
  if(!terms.length)return 0;
  const texts=fields.map(field=>sourceNormalize(field.text));
  let score=0;
  for(const term of terms){
    const hits=fields.filter((field,i)=>termStartsWord(texts[i],term));
    if(!hits.length)return 0;
    score+=Math.max(...hits.map(hit=>hit.weight));
  }
  const heading=texts[0],whole=terms.join(" ");
  if(heading===whole)score+=1000;
  else if(heading.startsWith(whole))score+=100;
  return score;
}
export interface SourceCpanelSearchResult{
  readonly item:SourceCpanelRegistryItem;
  readonly tasks:readonly SourceCpanelTask[];
  readonly score:number;
}
export function sourceCpanelSearchRegistry(
  query:string,items:readonly SourceCpanelRegistryItem[]=SOURCE_CPANEL_REGISTRY
):SourceCpanelSearchResult[]{
  const terms=sourceNormalize(query).trim().split(/\s+/).filter(Boolean);
  if(!terms.length)return [];
  const results:SourceCpanelSearchResult[]=[];
  for(const item of items){
    let score=scoreTextFields([{text:item.label,weight:10}],terms);
    const tasks:SourceCpanelTask[]=[];
    for(const task of item.tasks){
      const fields=[{text:task.label,weight:10},
        ...(task.keywords?[{text:task.keywords,weight:1}]:[])];
      const taskScore=scoreTextFields(fields,terms);
      if(taskScore){
        tasks.push(task);
        score=Math.max(score,taskScore);
      }
    }
    if(score)results.push({item,tasks,score});
  }
  return results.sort((a,b)=>b.score-a.score);
}
export const SOURCE_CPANEL_SUPPORTED_PANELS=new Set(
  ["display","programs","accounts","notification","action-center","backup"]
);
export function sourceCpanelIsSupported(id:string):boolean{
  return SOURCE_CPANEL_SUPPORTED_PANELS.has(id);
}
