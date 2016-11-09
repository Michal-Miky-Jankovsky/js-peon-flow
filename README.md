# js-peon-flow

##Done##
**project.js** - config file

**concat**

**flow-remove-types**

**uglify**

**debug server** - port selection is possible

**file watcher** - configurable list of directories triggers build

**.copy** file - contains path to copy all /bin files

build server handle all /bin files requests from browser so you never get non-updated source files

**distribution** - add dependency to package.json

    "peon-js": "git+https://github.com/lukasfila/js-peon-flow.git"


##Todo##
project template

modules?

concat bug


##How it works##
1) Create new project

2) Use basic package.json file

    {
        "name": "project",
    	"scripts": {
    		"install": "node node_modules/peon/peon/setup"
    	},
    	"dependencies": {
    		"peon-js": "git+https://github.com/lukasfila/js-peon-flow.git"
    	}
    }

3) Run "npm install"

4) Wait for setup is done

5) just simply run "peon"

6) debug server started with selected port

7) do something