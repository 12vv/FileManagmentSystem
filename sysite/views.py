from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
# Create your views here.
from sysite import models
import time
import re
import os
from django.core import serializers
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import auth

import json
from bson import ObjectId

# 文件
from django.core.files.storage import FileSystemStorage


class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)


def login_page(request):
    return render(request, 'static/html/login.html')


def main(request):
    sess = request.session.get('id')
    if sess:
        return render(request, 'static/html/main.html', {'sess':  request.session["id"]})
    else:
        return render(request, 'static/html/login.html')

# login 登录
@csrf_exempt
def login(request):
    if request.method == 'GET':
        return render(request, 'static/html/login.html')
    else:
        username = request.POST.get('username')
        password = request.POST.get('password')
        # sql = "select * from sysite_user where name = '" + name + "'and password ='" + password + "'"
        user = models.User.objects.filter(id__exact=username, password__exact=password).first()
        # user = auth.authenticate(id=username, password=password)
        if user:
            # auth.login(request, user)
            # return HttpResponseRedirect('main')
            data = 'success'
            request.session['id'] = user.id
        else:
            data = "error"
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# logout 登出
def logout(request):
    del request.session["id"]
    return render(request, 'static/html/login.html')


# ID_confirm id验证
@csrf_exempt
def id_confirm(request):
    if request.method == 'POST':
        tag = models.User.objects.filter(id=request.POST.get('username'))
        if tag:
            data = 'error'
        else:
            data = 'success'
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# email_confirm email验证
@csrf_exempt
def email_confirm(request):
    if request.method == 'POST':
        tag = models.User.objects.filter(mailbox=request.POST.get('email'))
        if tag:
            data = 'error'
        else:
            data = 'success'
    return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# register 注册
@csrf_exempt
def register(request):
    if request.method == 'POST':
        # uf = models.User(request.POST)
        id = request.POST.get('username')
        mailbox = request.POST.get('email')
        password = request.POST.get('password')
        models.User.objects.create(id=id, password=password, mailbox=mailbox)
        data = 'success'
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# upload 上传文件
@csrf_exempt
def upload(request):
    base_url = 'media/'
    if request.method == 'POST':
        file = request.FILES.get('file')  # 获取文件对象，包括文件名文件大小和文件内容
        dir = request.POST.get('dir')
        print(dir)
        fileName = file.name
        # 正则表达式获取后缀
        prefix = re.findall(r'(.+?)\.', fileName)[0]
        # type = re.findall(r'\.[^.\\/:*?"<>|\r\n]+$', fileName)[0]
        # python获取后缀
        type = os.path.splitext(fileName)[-1][1:]

        # print(file.read())
        # with open(base_url + file.name, 'wb+')as dir:
        #     for chunk in file.chunks():
        #         dir.write(chunk)
        date = time.strftime('%Y-%m-%d', time.localtime(time.time()))
        models.FileDetail.objects.create(name=prefix, type=type, owner=request.session['id'], time=date, size=file.size,
                                   url=base_url+file.name, parent_dir=dir)
        data = { "result": "success", "detail": {"name": prefix, "type": type, "owner": request.session['id'], "time": date, "size": file.size}}
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# newFolder 新建文件夹
@csrf_exempt
def newFolder(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        type = request.POST.get('type')  # type = 'folder'
        owner = request.POST.get('owner')
        parent_dir = request.POST.get('parent_dir')
        date = time.strftime('%Y-%m-%d', time.localtime(time.time()))
        models.Folder.objects.create(name=name, type=type, owner=request.session['id'], time=date, parent_dir=parent_dir)
        data = {"result": "success",
                "detail": {"name": name, "type": type, "owner": request.session['id'], "time": date}}
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# getFile 获取当前目录下文件和文件夹
@csrf_exempt
def getFile(request):
    if request.method == 'GET':
        dir = request.GET.get("dir")
        all_folder = models.Folder.objects.filter(parent_dir=dir)
        all_file = models.FileDetail.objects.filter(parent_dir=dir)
        folders = serializers.serialize("json", all_folder)
        files = serializers.serialize("json", all_file)
        print(json.dumps(folders))
        data = {"result": "success",
                "message": {"folders": folders, "files": files}}
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')