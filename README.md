# Lister

## TODOS
### IMPORTANT TODOS
- mark items as priority, they are locked at the top
- reminder div styling is bad
- confirmation button for deleting item
- list types
  - a type of list like this one right here
  - checklist
  - default
  - plain text ?
- settings menu
  - save in settings.json file
  - import and export list.json
    - option to combine or replace the imported list and current one
    - do something if the imported list doesn't work
- collapse items, just show title
- move items
  - function to move list items easily
- archive lists
- add a changelog in app


### UNIMPORTANT TODOS
- packaged versions do not have exe icon, but do have taskbar icon
- right click menu
- button to make new sublist
- placeholders for titles
- when you call generatelist it will uncollapse all items and reset some things that don't need to be
- "archive" option for items, sends them to bottom of that sublist collapsed so they arent in the way but you can still view them
probably for completed items that you still want to be able to see but not have in the way
- sort of miniviewer that you can just have on ur desktop that shows things but you cant edit them and its smaller
- drag and drop media 
- holding down shift when hovering over item opens the settings
- button to open media folder
- set reminders for a time instead of duration
- image and video fallbacks
- more than 1 reminder at a time
- if you set a reminder then edit the description or title, notification will not have the most recent title and description
- date of completion above or under date created
- delete file from media folder if no items are using it

### BUGS--NEED TO FIX
- creating second instances with first one in tray does not focus it, only focuses if second instance is minimized 


## RELEASES
###FEATURES PUSHED IN BETA 2
- prevented multiple instances
- always on top
- multiple media files
- audio files
- refresh button
- send user to top when clicking on settings button
- creating new list
- deleting lists

### FEATURES PUSHED IN BETA 3
- adding links
- fixed bug where hovering over status dot would push item title
- completed items get sent to the bottom
- set collapse button title to show how many items it's going to show/hide

### FEATURES PUSHED IN BETA 4
- new item button in sublist title div
- both new item buttons send new one to the top
- opening another instances when current one is in the tray will show the original one
- contenteditable elements will only send their innertext to the json file if it's actually been changed/edited
- exe has proper icon now

### FEATURES PUSHED IN BETA 5
- duplicate item button
- pushed to github
- option to add item to top or bottom of sublist
