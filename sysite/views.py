from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
# Create your views here.
from sysite import models

from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import auth

import json
from bson import ObjectId


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


