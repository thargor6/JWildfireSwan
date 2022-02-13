# JWildfire Swan - awesome fractal flames, GPU accelerated

![Example 1](example1.jpg?raw=true)

This is an experimental project and work in progress.

## Project goals
![Example 4](example4.jpg?raw=true)
The basic idea is to use standard Web-technologies to create an application which allows playful access to the fascinating world of fractal flames, without barriers.
So it shall be simple to use and require no certain hardware or operating system.

It is a clear side-project (rather than a replacement) to JWildfire and will never have such a lot of features (by design).
So it is more a game than a professional application, even you will be able to
create real art with it.

There shall be no special GPU mode, so GPU (when available) is used per default.

![Example 2](example2.jpg?raw=true)

## Technical details
![Example 5](example5.jpg?raw=true)
The user-interface is made use Vaadin Fusion.
The app will be executed using the electron-framework, which means it runs on all major platforms and uses internally a Chromium-browser. 
The flame-code will be implemented using TypeScript and WebGL.

Some concepts, especially the WebGL buffer setup, are inspired by 
https://github.com/richardassar/ElectricSheep_WebGL by Richard Assar.

## Live demo
![Example 6](example6.jpg?raw=true)
You can try it here: https://herokuapp.overwhale.com/ 
(it is early alpha version, and may be offline or may take some while to start)

![Example 3](example3.jpg?raw=true)
## Build


### Install j-wildfire-lib into project repository

mvn deploy:deploy-file -Durl=file:////Users/<USER>/.m2/repository/ -Dfile=/<COMPLETE_PATH>/j-wildfire-7.30.0.jar -DgroupId=com.jwildfire -DartifactId=j-wildfire-lib -Dpackaging=jar -Dversion=7.30.0