# CrunchyRoll.js

CrunchyRoll.js is capable of downloading anime from the popular CrunchyRoll
streaming site. Each episode is stored with the original video encoding
(usually H.264, MP4) and the configured subtitle format (ASS or SRT). The two
output files can optionally be muxed into a single MKV file.

## Motivation

I **love** *CrunchyRoll*. They have been working hard to provide an amazing service to
*anime* fans and provide the *absolute best* way to watch *anime* series in a legal
way. As they offer a streaming service, they do not offer files to be downloaded
and enjoyed while offline (or travelling). This is understandable from a
business perspective, but extremely annoying for the end-user. I put this
application together to enable the files to be stored and enjoyed while offline.
Please do not download as much as you can and stop your premium subscription;
without our financial support, they cannot give us such as great service!
**Do not share downloaded files and delete them if you ever stop your
premium subscription!**

## Status

### Implemented

* Subtitle decoding.
* Subtitle converter for SRT subtitle output.
* Video streaming.
* Episode page scraping with subtitle saving and video streaming.

### Pending Implementation

* Detect and write the appropriate video extension (instead of hard-code mp4).
* Improve SRT support for i, b and u.
* Add ASS support.
* Add muxing (MP4+ASS=MKV).
* Add series API to download an entire series rather than per-episode.
* Add batch-mode to queue a bunch of series and do incremental downloads.
* Add authentication to the entire stack to support premium content.
* Add CLI interface with all the options.
* Enjoy beautiful anime series from disk when internet is down.

## Work In Progress

Open an issue or e-mail me directly. I'd be happy to answer your questions.
