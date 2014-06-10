url.js
======

A tiny library for getting variables out of your url. Nice for making dev flags and such.

URL                     | expression                    | result 
:-----------------------|:------------------------------|:------
host.com/?debug         | ```url.boolean('debug')```    | ```true```
host.com/               | ```url.boolean('debug')```    | ```false```
host.com/?speed=5       | ```url.number('speed')```     | ```5```
host.com/               | ```url.number('speed', 10)``` | ```10```
host.com/?foo=bar&val=3 | ```url.foo```                 | ```"bar"```
host.com/?foo=bar&val=3 | ```url.val```                 | ```"3"```
host.com/#about         | ```url.hash```                | ```"about"```