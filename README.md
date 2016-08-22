# Crunchy.js: a fork of Deathspike/CrunchyRoll.js

*Crunchy.js* is capable of downloading *anime* episodes from the popular *CrunchyRoll* streaming service. An episode is stored in the original video format (often H.264 in a MP4 container) and the configured subtitle format (ASS or SRT).The two output files are then merged into a single MKV file.

## Motivation

*CrunchyRoll* has been providing an amazing streaming service and offers the best way to enjoy *anime* in a *convenient* and *legal* way. As a streaming service, video files cannot be downloaded and watched offline. Understandable from a business perspective and considering possible contract implications, but annoying for users. This application enables episodes to be downloaded for offline convenience. Please do not abuse this application; download episodes for **personal use** and **delete them** if you do not have an active premium account. Continue to support *CrunchyRoll*; without our financial backing their service cannot exist!

## Legal Warning

This application is not endorsed or affliated with *CrunchyRoll*. The usage of this application enables episodes to be downloaded for offline convenience which may be forbidden by law in your country. Usage of this application may also cause a violation of the agreed *Terms of Service* between you and the stream provider. A tool is not responsible for your actions; please make an informed decision prior to using this application.

**PLEASE USE THIS TOOL ONLY IF YOU HAVE A PREMIUM ACCOUNT**

## Configuration

It is recommended to enable authentication (`-p` and `-u`) so your account permissions and settings are available for use. It is not possible to download non-free material without an account and premium subscription. Furthermore, the default account settings are used when downloading. If you want the highest quality videos, configure these preferences at https://www.crunchyroll.com/acct/?action=video.


## Prerequisites

* NodeJS >= 0.12.x (http://nodejs.org/)
* NPM >= 2.5.x (https://www.npmjs.org/)

## Installation

Use the applicable instructions to install. Is your operating system not listed? Please ask or contribute!

### Debian (Mint, Ubuntu, etc)

1. Run in *Terminal*: `sudo apt-get install nodejs npm mkvtoolnix rtmpdump ffmpeg`
2. Run in *Terminal*: `sudo ln -s /usr/bin/nodejs /usr/bin/node`
3. Run in *Terminal*: `sudo npm install -g crunchy`

### Mac OS X

1. Install *Homebrew* following the instructions at http://brew.sh/
2. Run in *Terminal*: `brew install node mkvtoolnix rtmpdump ffmpeg`
3. Run in *Terminal*: `npm install -g crunchy`

### Windows

1. Install *NodeJS* following the instructions at http://nodejs.org/
3. Run in *Command Prompt*: `npm install -g crunchy`

## Instructions

Use the applicable instructions for the interface of your choice (currently limited to command-line).

### Command-line Interface (`crunchy`)

The [command-line interface](http://en.wikipedia.org/wiki/Command-line_interface) does not have a graphical component and is ideal for automation purposes and headless machines. The interface can run using a sequence of series addresses (the site address containing the episode listing), or with a batch-mode source file. The `crunchy --help` command will produce the following output:

    Usage: crunchy [options]

    Options:

      -h, --help         output usage information
      -V, --version      output the version number
      -p, --pass <s>     The password.
      -u, --user <s>     The e-mail address or username.
      -c, --cache        Disables the cache.
      -m, --merge        Disables merging subtitles and videos.
      -e, --episode <i>  The episode filter.
      -v, --volume <i>   The volume filter.
      -f, --format <s>   The subtitle format. (Default: ass)
      -o, --output <s>   The output path.
      -s, --series <s>   The series override.
      -t, --tag <s>      The subgroup. (Default: CrunchyRoll)

#### Batch-mode

When no sequence of series addresses is provided, the batch-mode source file will be read (which is *CrunchyRoll.txt* in the current work directory. Each line in this file is processed as a seperate command-line statement. This makes it ideal to manage a large sequence of series addresses with variating command-line options or incremental episode updates.

#### Examples

Download in batch-mode:

    crunchy

Download *Fairy Tail* to the current work directory:

    crunchy http://www.crunchyroll.com/fairy-tail

Download *Fairy Tail* to `C:\Anime`:

    crunchy --output C:\Anime http://www.crunchyroll.com/fairy-tail

#### Switches

##### Authentication

* `-p or --pass <s>` sets the password.
* `-u or --user <s>` sets the e-mail address or username.

##### Disables

* `-c or --cache` disables the cache.
* `-m or --merge` disables merging subtitles and videos.

##### Filters

* `-e or --episode <i>` filters episodes (positive is greater than, negative is smaller than).
* `-v or --volume <i>` filters volumes (positive is greater than, negative is smaller than).

##### Settings

* `-f or --format <s>` sets the subtitle format. (Default: ass)
* `-o or --output <s>` sets the output path.
* `-s or --series <s>` sets the series override.
* `-t or --tag <s>` sets The subgroup. (Default: CrunchyRoll)

## Developers

More information will be added at a later point. For now the recommendations are:

* Atom with `atom-typescript` and `linter-tslint` (and dependencies).

Since this project uses TypeScript, compile with `node ts` or `npm install`.
