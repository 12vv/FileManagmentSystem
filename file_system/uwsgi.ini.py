# -*- coding: utf-8 -*-
# [uwsgi]
# socket = 127.0.0.1:8000
# chdir = /root/blog
# module = mysite.wsgi    #这里填的是相对路径
# master = true
# processes = 2
# threads = 2
# max-requests = 2000
# vacuum = true
# daemonize = /djproject/mysite/uwsgi.log
# stats = 127.0.0.1:9001
# post-buffering = 65535
# buffer-size = 65535
# harakiri-verbose = true
# harakiri = 300
# uid = nginx
# pidfile = /djproject/mysite/uwsgi.pid
