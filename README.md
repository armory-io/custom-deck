# deck-armory
Armory's Deck Extension

This repository is a monolith repo, with multiple projects inside. See below on how to work on each piece.

<!-- MarkdownTOC autolink="true"  bracket="round" -->

- [Armory's Deck - `src/`](#armorys-deck---src)
  - [AngularJS](#angularjs)
  - [React](#react)
  - [Routing](#routing)
- [Adding a new feature flag](#adding-a-new-feature-flag)
- [Building and running the docker container](#building-and-running-the-docker-container)
- [How package.json/yarn.lock works](#how-packagejsonyarnlock-works)
- [Building deck modules, but its breaking](#building-deck-modules-but-its-breaking)
- [Troubleshooting CORS](#troubleshooting-cors)

<!-- /MarkdownTOC -->



## Running deck-armory locally
To run your local version of deck:

```bash
./bin/dependencies.sh 2_4_x   # change the version as needed
nvm use $(node -e "console.log(require('./package.json').engines.node.replace(/^(>|=)*/, ''))")
./bin/dev-install.sh    # installs our packages.json and OSS package.json
DECK_PORT=9000 API_HOST=https://preprod-api.spinnaker.armory.io ./bin/dev-run.sh    # starts the dev server
```
Now you can visit [http://localhost:9000/#/search](http://localhost:9000/#/search).

## Moving to the next OSS Release

/* IMPORTANT when you're upgrading to the next version, you'll need to do a diff of OSS current to next
```bash
cd ~/repos/oss/deck
git diff upstream/release-1.14.x..upstream/release-x app/scripts/app.ts
git diff upstream/release-1.14.x..upstream/release-x package.json
git diff upstream/release-1.14.x..upstream/release-x webpack.config.js
```

## About
This is our platform's web app. It is an AngularJS app that hosts React components. Routing is done with ui-router.

### AngularJS
The entry point to the app is `src/app.ts`. The code that combines `@spinnaker/core` can be found in `src/spinnaker.modules/`.

### React
Most of the directory structure in `src/` is organized like a standard React app (minus `src/spinnaker.modules/`). As you are working on the app, you should be able to focus making pages and components. The only extra thing to be aware of is how ui-router works.

### Routing
Routing is done with ui-router and is very tied to Deck. The router state is initialized in Deck. The code that adds the routes is in `src/spinnaker.modules/armory.states.ts` and the route definitions can be found in `src/layout/Routes/routes.ts`. Examples of how links should be done can be found in `src/layout/Header/Header.tsx` (notice that the link uses the route name not the route URL).


## Adding a new feature flag
TODO, @kevinawoo/nicolas hasn't through this yet, but it involves making changes to:
- our local settings-local.js
- our halconfig/settings.js

## Building and running the docker container
See `/bin/build.sh`. After running that script, it'll produce a docker image that contains everything in `build/webpack`.
```bash
arm build

# run the docker container locally
docker run --rm -it -v ~/.spinnaker:/opt/spinnaker/config -p 9000:9000 armory/deck-armory:$HASH
```



## How package.json/yarn.lock works
How does Netflix deal with their internal version of `package.json` and `yarn.lock`? They do it by hand.  

![](https://cl.ly/442m3Z2c0N0T/Image%202018-03-14%20at%2016.21.54.png)

So we have a few scripts to help with this. 

For `package.json`:
- [`bin/merge-package-jsons.js`](https://github.com/armory-io/deck-armory/blob/master/bin/merge-package-jsons.js) - This script (ran during build or dev) combines both our stuff and their stuff and throws errors when we override OSS version of a package.

For `yarn.lock`:
Yarn actually is pretty smart, we can just concat both files together and let yarn to figure it out.



## Building deck modules, but its breaking
Are you building a release branch? Getting an error similar to?
```
$ ~/repos/jenkins-builders/spinnaker/build-deck-modules.sh
...
* Where:
Build file '/Users/kevinwoo/repos/build/deck/build.gradle' line: 20

* What went wrong:
A problem occurred evaluating root project 'deck-ui'.
> Failed to apply plugin [class 'nebula.plugin.bintray.NebulaBintrayPublishingPlugin']
   > Invalid branch (release-1.6.x) for nearest normal (2.1176.0).
```
Gradle will do a check against the current branch name and the latest release commit. If its too far way, it'll error out. To avoid this error, go directly to commit hash and it won't complain anymore!. 
Example:
```bash
git checkout origin/release-1.6.x 
```

## Troubleshooting CORS
If you run into CORS issues, it's because https dropping down to http.
The root cause to set `^https?:\/\/(?:localhost|preprod\.spinnaker\.armory\.io|[0-9\.]+)(?::[1-9]\d*)?\/?$` in halconfig. 

If you can't do that (a customer's env), a workaround is to boot a new chrome instance without web security.

⚠️ Only visit what you need to visit in this browser.
```bash
function chromecors() {
  chromeDir="${HOME}/tmp/armory-my-stuff/chrome-disable-web-security"
  mkdir -p ${chromeDir}
  cp ${HOME}/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/*.1password.json ${chromeDir}/NativeMessagingHosts/ || true
  /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-web-security --user-data-dir=${chromeDir}
}

chromecors
```
