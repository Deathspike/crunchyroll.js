# CrunchyRoll.js

*CrunchyRoll.js* is capable of downloading *anime* episodes from the popular
*CrunchyRoll* streaming service. An episode is stored in the original video format
(often H.264 in a MP4 container) and the configured subtitle format (ASS or
SRT).The two output files are then merged into a single MKV file.

## Motivation

*CrunchyRoll* has been providing an amazing streaming service and offers the
best way to enjoy *anime* in a *convenient* and *legal* way. As a streaming
service, video files cannot be downloaded and watched offline. Understandable
from a business perspective and considering possible contract implications, but
annoying for users. This application enables episodes to be downloaded for
offline convenience. Please do not abuse this application; download episodes for
**personal use** and **delete them** if you do not have an active premium
account. Continue to support *CrunchyRoll*; without our financial backing their
service cannot exist!

## Legal Warning

This application is not endorsed or affliated with *CrunchyRoll*. The usage of
this application enables episodes to be downloaded for offline convenience which
may be forbidden by law in your country. Usage of this application may also
cause a violation of the agreed *Terms of Service* between you and the stream
provider. A tool is not responsible for your actions; please make an informed
decision prior to using this application.

## Status

### Implemented

* Subtitle decoding.
* Subtitle converter for SRT subtitle output.
* Video streaming.
* Episode page scraping with subtitle saving and video streaming.
* Add ASS support.
* Add muxing (MP4+ASS=MKV).
* Add series API to save an entire series rather than per-episode.
* Add support for incremental saves.
* Add batch-mode to queue a bunch of series.
* Add CLI interface with all the options.
* Support scheduled merging; if it fails now, the video is probably being watched.
* Add authentication to the entire stack to support premium content.
* Binary runner for `npm`
* Windows examples with a .bat for ease of use.
* Publish to `npm` with a fixed package.json.

### Pending Implementation

* Documentation.
* Enjoy beautiful anime series from disk when internet is down.

## Configuration

Set defaults in https://www.crunchyroll.com/acct/?action=video. We'll use that.

## Work In Progress

Open an issue or e-mail me directly. I'd be happy to answer your questions.
