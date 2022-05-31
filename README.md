# Lister

### TODOS

- reminder div styling is bad
- style audio items
- search through items in a sublist
- loading splash screen
- holding shift while hovering over an item will show the settings
- confirmation button for deleting item and list
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
- keyboard shortcuts
- macos support
- notification with video element should set notification image to the video thumbnail
- move items
  - function to move list items easily
- archive lists
- add a changelog in app
- link items together
- show how many items are completed out of the total in sublist collapse title
  - "Collapse "Sublist" (3/8)"
- In-app changelog
- remove default title for item and automatically focus on the title box
  - is user clicks off and leaves title empty, delete the item
- vertical scroll bar
- option to only delete 1 media file
- make multi line titles wrap around the status dot
- right click menu
  - right clicking on sublist gives option to add item to top or bottom, collapse/show, and delete
- button to make new sublist
- media fallbacks
- placeholders for titles
- when you call generatelist it will uncollapse all items and reset some things that don't need to be
- "archive" option for items, sends them to bottom of that sublist collapsed so they arent in the way but you can still view them
  probably for completed items that you still want to be able to see but not have in the way
- sort of miniviewer that you can just have on ur desktop that shows things but you cant edit them and its smaller
- drag and drop media
- button to open media folder
- set reminders for a time instead of duration
- more than 1 reminder at a time
- if you set a reminder then edit the description or title, notification will not have the most recent title and description
- date of completion above or under date created
- delete file from media folder if no items are using it
- resizing/scaling
- inserting icons into item titles
- goodnight text is broken
- save collapse state in list.json
- no space on days ago, results in "2days ago"
- make status dot get bigger/smaller on hover/click
- change "new item to top" to "new item at top" in button title
- have full path to media on media element title 
  - instead of "image.png", say "C:Users/user1/Programs/Lister/media/image.png"
- checklists in item description


### URGENT/BUGS
- creating second instances with first one in tray does not focus it, only focuses if second instance is minimized
- if you have a priority item and then add item to top, the new item will be above it

## RELEASES

### FEATURES PUSHED IN BETA 2

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
- both new item buttons send new item to the top
- opening another instances when current one is in the tray will show the original one
- contenteditable elements will only send their innertext to the json file if it's actually been changed/edited
- exe has proper icon now

### FEATURES PUSHED IN BETA 5

- code pushed to github
- option to add item to top or bottom of sublist
- changes to item settings
  - duplicate item button
  - icons have color on hover
  - delete item button is sent to the right and has a slightly different styling than the others
- button to close global settings inside of the div
- dynamic "hello" text at top of the app
- priority items
- priority items get sent to the top
- styling changes
  - app is darker
  - text is darker
  - svgs have rounded corners
  
### FEATURES PUSHED IN BETA 6