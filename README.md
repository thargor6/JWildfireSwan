# JWildfire Swan - playful fractal flames, GPU accelerated 

![Example](example1.jpg?raw=true)

This is an experimental project and work in progress.

## Project goals

The basic idea is to use standard Web-technologies to create an application which allows playful access to the fascinating world of fractal flames, without barriers.
So is shall be simple to use and require no certain hardware or operating system.

It is a clear side-project (rather than a replacement) to JWildfire and will never have such a lot of features (by design).
So it is more a game than a professional application, even you will be able to
create real art with it.

There shall be no special GPU mode, so GPU (when available) is used per default.

## Technical details
The user-interface is made use Vaadin Fusion.
The app will be executed using the electron-framework, which means it runs on all major platforms and uses internally a Chromium-browser. 
The flame-code will be implemented using TypeScript and WebGL.

Some concepts, especially the WebGL buffer setup, are inspired by 
https://github.com/richardassar/ElectricSheep_WebGL by Richard Assar.
