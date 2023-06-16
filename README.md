# DroneModels

This repo is used to track the file droneModels.json which is bundled
across the OpenAthena application platforms.  It contains drone
CMOS/CCD specifications in order to make arbitrary point selection
more accurate.  Use the linux command-line utility jq to syntax check
the json file before you commit it.

```
% jq . droneModels.json
% echo $?
```

The exit code should be 0 if the file is syntactically correct.

Updates to this file will occur periodically as we test and validate
drone models and through user submissions.

[Theta](https://theta.limited/) provides a free and open source UAS
geodesy platform which enables a competitive advantage for its users.

OpenAthena™ allows common drones to spot precise geodetic locations.

An Android port of the [OpenAthena project](http://OpenAthena.com)

An iOS port of the [OpenAthena project](http://OpenAthena.com)

