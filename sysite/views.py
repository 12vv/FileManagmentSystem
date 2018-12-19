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
import shutil
import json
from bson import ObjectId

# 文件
from django.core.files.storage import FileSystemStorage

import pymysql
# db = pymysql.connect("localhost", "Garrick", "123456", "file_system")
from sysite.mysqlHelper import MysqlHelper

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

# 获取文件大小
def getFileSize(path):
    try:
        size = os.path.getsize(path)
        return formatSize(size)
    except Exception as err:
        print(err)


# 字节bytes转化kb\m\g
def formatSize(bytes):
    try:
        bytes = float(bytes)
        kb = round(bytes / 1024, 2)
    except:
        print("传入的字节格式不对")
        return "Error"

    if kb >= 1024:
        M = round(kb / 1024, 2)
        if M >= 1024:
            G = round(M / 1024, 2)
            return "%.2fG" % (G)
        else:
            return "%.2fM" % (M)
    else:
        return "%.2fkb" % (kb)


def login_page(request):
    return render(request, 'static/html/login.html')


def main(request):
    sess = request.session.get('id')
    if sess:
        return render(request, 'static/html/main.html', {'sessid':  request.session["id"], 'sessname': request.session["name"], 'level': request.session["level"]})
    else:
        return render(request, 'static/html/login.html')

# 管理员
def admin(request):
    sess = request.session.get('id')
    if sess:
        return render(request, 'static/html/admin.html', {'sessid': request.session["id"], 'sessname': request.session["name"], 'level': request.session["level"]})
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
        db = MysqlHelper()
        sql = "SELECT * FROM sysite_user WHERE name = %s and password = %s"
        params = [username, password]
        res = db.fetchone(sql, params)
        print(res)
        if res:
            data = {'result': 'success', 'level': res[5]}
            request.session['id'] = res[0]
            request.session['name'] = res[3]
            request.session['level'] = res[5]
        else:
            data = "error"
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# logout 登出
def logout(request):
    del request.session["id"]
    del request.session["name"]
    return render(request, 'static/html/login.html')


# ID_confirm id验证
@csrf_exempt
def id_confirm(request):
    if request.method == 'POST':
        name = request.POST.get('username')
        # tag = models.User.objects.filter(id=request.POST.get('username'))
        db = MysqlHelper()
        sql = "SELECT * FROM sysite_user WHERE name = %s"
        params = [name]
        res = db.fetchone(sql, params)
        print(res)
        if res:
            data = 'error'
        else:
            data = 'success'
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# email_confirm email验证
@csrf_exempt
def email_confirm(request):
    if request.method == 'POST':
        # tag = models.User.objects.filter(mailbox=request.POST.get('email'))
        mailbox = request.POST.get('email')
        db = MysqlHelper()
        sql = "SELECT * FROM sysite_user WHERE mailbox = %s"
        params = [mailbox]
        res = db.fetchone(sql, params)
        if res:
            data = 'error'
        else:
            data = 'success'
    return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# register 注册
@csrf_exempt
def register(request):
    if request.method == 'POST':
        # uf = models.User(request.POST)
        name = request.POST.get('username')
        mailbox = request.POST.get('email')
        password = request.POST.get('password')
        db = MysqlHelper()
        sql = "INSERT INTO sysite_user (name, password, mailbox) VALUES (%s, %s, %s)"
        params = [name, password, mailbox]
        res = db.insert(sql, params)
        # models.User.objects.create(id=id, password=password, mailbox=mailbox)
        data = 'success'
    return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# upload 上传文件
@csrf_exempt
def upload(request):
    base_url = 'media/' + str(request.session['id']) + '/'
    if not os.path.exists(base_url):
        os.makedirs(base_url)
    if request.method == 'POST':
        file = request.FILES.get('file')  # 获取文件对象，包括文件名文件大小和文件内容
        dir = request.POST.get('dir')
        print(dir)
        fileName = file.name
        # 正则表达式获取前缀
        prefix = re.findall(r'(.+?)\.', fileName)[0]
        # type = re.findall(r'\.[^.\\/:*?"<>|\r\n]+$', fileName)[0]
        # python获取后缀
        type = os.path.splitext(fileName)[-1][1:]
        date = time.strftime('%Y-%m-%d', time.localtime(time.time()))

        # 写入文件
        with open(base_url + file.name, 'wb+') as f:
            for chunk in file.chunks():
                f.write(chunk)

        size = formatSize(file.size)
        print(size)

        db = MysqlHelper()
        sql1 = "INSERT INTO sysite_file (name, type, author, time, size, url) VALUES (%s, %s, %s, %s, %s, %s)"
        params = [prefix, type, request.session['id'], date, size, base_url+file.name]
        res = db.insert(sql1, params)
        db = MysqlHelper()
        sql3 = "SELECT max(id) from sysite_file"
        new_id = db.fetchone(sql3, [])[0]
        # 插入关联表
        db = MysqlHelper()
        sql2 = "INSERT INTO sysite_fileuser (userId, fileId, dir, oDate) VALUES (%s, %s, %s, %s)"
        params = [request.session['id'], new_id, dir, date]
        res2 = db.insert(sql2, params)
        print(res2)
        data = { "result": "success", "detail": {"name": prefix, "type": type, "owner": request.session['id'], "time": date, "size": file.size}}
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# newFolder 新建文件夹
@csrf_exempt
def newFolder(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        type = request.POST.get('type')  # type = 'folder'
        owner = request.POST.get('owner')
        dir = request.POST.get('parent_dir')
        date = time.strftime('%Y-%m-%d', time.localtime(time.time()))
        db = MysqlHelper()
        sql1 = "INSERT INTO sysite_folder (name, author, time) VALUES (%s, %s, %s)"
        params = [name, request.session['id'], date]
        res = db.insert(sql1, params)
        db = MysqlHelper()
        sql3 = "SELECT max(id) from sysite_folder"
        new_id = db.fetchone(sql3, [])[0]
        # 插入关联表
        db = MysqlHelper()
        sql2 = "INSERT INTO sysite_folderuser (userId, folderId, dir, oDate) VALUES (%s, %s, %s, %s)"
        params = [request.session['id'], new_id, dir, date]
        res2 = db.insert(sql2, params)
        print(res2)
        # models.Folder.objects.create(name=name, type=type, owner=request.session['id'], time=date, parent_dir=parent_dir)
        data = {"result": "success",
                "detail": {"name": name, "type": type, "owner": request.session['id'], "time": date}}
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# newFolder 重命名
@csrf_exempt
def rename(request):
    base_url = 'media/' + str(request.session['id']) + '/'
    if request.method == 'POST':
        type = request.POST.get('type')
        id = request.POST.get('id')
        newName = request.POST.get('newName')
        oldName = request.POST.get('name')
        oldUrl = base_url + oldName + '.' + type
        newUrl = base_url + newName + '.' + type
        if type == 'folder':
            db = MysqlHelper()
            sql1 = "UPDATE sysite_folder SET name = %s WHERE id = %s"
            res1 = db.update(sql1, [newName, id])
            if res1:
                data = {"result": "success", "message": "修改成功"}
            else:
                data = {"result": "failed"}
        else:
            db = MysqlHelper()
            sql2 = "UPDATE sysite_file SET name = %s, url = %s WHERE id = %s"
            res = db.update(sql2, [newName, newUrl, id])
            # 还需要改写项目文件
            shutil.move(oldUrl, newUrl)
            if res:
                data = {"result": "success", "message": "修改成功"}
            else:
                data = {"result": "failed"}
    return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# paste 复制粘贴
@csrf_exempt
def paste(request):
    base_url = 'media/' + str(request.session['id']) + '/'
    if request.method == 'POST':
        type = request.POST.get('type')
        id = request.POST.get('id')
        name = request.POST.get('name')
        dir = request.POST.get('dir')
        size = request.POST.get('size')
        url = base_url + name + '.' + type
        copyUrl = base_url + name + '-copy.' + type
        date = time.strftime('%Y-%m-%d', time.localtime(time.time()))
        if type != 'folder':
            db = MysqlHelper()
            sql1 = "INSERT INTO sysite_file (name, type, author, time, size, url) VALUES (%s, %s, %s, %s, %s, %s)"
            params = [name + '-copy', type, request.session['id'], date, size, copyUrl]
            res = db.insert(sql1, params)
            db = MysqlHelper()
            sql3 = "SELECT max(id) from sysite_file"
            new_id = db.fetchone(sql3, [])[0]
            # 插入关联表
            db = MysqlHelper()
            sql2 = "INSERT INTO sysite_fileuser (userId, fileId, dir, oDate) VALUES (%s, %s, %s, %s)"
            params = [request.session['id'], new_id, dir, date]
            res2 = db.insert(sql2, params)
            print(res2)
            # 复制并重命名新文件
            shutil.copy(url, copyUrl)
            if res and res2:
                data = {"result": "success", "message": "成功粘贴"}
            else:
                data = {"result": "failed"}
        else:
            # 文件夹剪切
            db = MysqlHelper()
            sql2 = "UPDATE sysite_folderuser SET dir = %s WHERE userId = %s, folderId = %s"
            res = db.update(sql2, [dir, request.session['id'], id])
            if res:
                data = {"result": "success", "message": "剪切成功"}
            else:
                data = {"result": "failed"}
    return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# getFile 获取当前目录下文件和文件夹
@csrf_exempt
def getFile(request):
    if request.method == 'GET':
        dir = request.GET.get("dir")
        uid = request.session["id"]
        db = MysqlHelper()
        sql1 = "SELECT sysite_file.id, sysite_file.name, type, author, time, size , url, sysite_user.name, authority " \
              "FROM sysite_file, sysite_fileuser, sysite_user, sysite_mode " \
              "WHERE status != 1 and sysite_file.id = sysite_fileuser.fileId and userId = %s " \
               "and dir = %s and sysite_file.author = sysite_user.id and sysite_mode.id = sysite_fileuser.mode"
        params = [uid, dir]
        res1 = db.fetchall(sql1, params)
        db = MysqlHelper()
        sql2 = "SELECT sysite_folder.id, sysite_folder.name, author, time, sysite_user.name, authority " \
              "FROM sysite_folder, sysite_folderuser, sysite_user, sysite_mode " \
              "WHERE status != 1 and sysite_folder.id = sysite_folderuser.folderId and userId = %s " \
               "and dir = %s and sysite_folder.author = sysite_user.id and sysite_mode.id = sysite_folderuser.mode"
        params = [uid, dir]
        res2 = db.fetchall(sql2, params)
        if res1 or res2:
            data = {"result": "success", "message": {"files": {}, "folders": {}}}
            if res1:
                for i, v in enumerate(res1):
                    data["message"]["files"][i] = {'id': v[0], 'name': v[1], 'type': v[2], 'author': v[7],
                                                   'time': v[4].isoformat(), 'size': v[5], 'url': v[6], 'mode': v[8], 'authorId': v[3]}
            if res2:
                for i, v in enumerate(res2):
                    data["message"]["folders"][i] = {'id': v[0], 'name': v[1], 'type': 'folder', 'author': v[4],
                                                     'time': v[3].isoformat(), 'mode': v[5], 'authorId': v[2]}
        else:
            data = {"result": "failed"}
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# getNode 获取目录
@csrf_exempt
def getNode(request):
    if request.method == 'GET':
        db = MysqlHelper()
        sql1 = "SELECT sysite_file.id, sysite_file.name, type, author, time, size , url, sysite_user.name, authority, dir " \
              "FROM sysite_file, sysite_fileuser, sysite_user, sysite_mode " \
              "WHERE status != 1 and sysite_file.id = sysite_fileuser.fileId and userId = %s " \
               "and sysite_file.author = sysite_user.id and sysite_mode.id = sysite_fileuser.mode"
        params = [request.session["id"]]
        res1 = db.fetchall(sql1, params)
        db = MysqlHelper()
        sql2 = "SELECT sysite_folder.id, sysite_folder.name, author, time, sysite_user.name, authority, dir " \
               "FROM sysite_folder, sysite_folderuser, sysite_user, sysite_mode " \
               "WHERE status != 1 and sysite_folder.id = sysite_folderuser.folderId and userId = %s " \
               "and sysite_folder.author = sysite_user.id and sysite_mode.id = sysite_folderuser.mode"
        params = [request.session["id"]]
        res2 = db.fetchall(sql2, params)
        if res1 or res2:
            data = {"status": "OK", "message": {"files": {}, "folders": {}}}
            if res1:
                for i, v in enumerate(res1):
                    data["message"]["files"][i] = {'id': v[0], 'name': v[1], 'type': v[2], 'author': v[7],
                                                   'time': v[4].isoformat(), 'size': v[5], 'url': v[6], 'mode': v[8], 'authorId': v[3], 'dir': v[9]}
            if res2:
                for i, v in enumerate(res2):
                    data["message"]["folders"][i] = {'id': v[0], 'name': v[1], 'type': 'folder', 'author': v[4],
                                                     'time': v[3].isoformat(), 'mode': v[5], 'authorId': v[2], 'dir': v[6]}
        else:
            data = {"status": "failed"}
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# delete 删除文件和文件夹
@csrf_exempt
def delete(request):
    if request.method == 'POST':
        folderList = json.loads(request.POST.get('folderList'))
        fileList = json.loads(request.POST.get('fileList'))
        date = time.strftime('%Y-%m-%d', time.localtime(time.time()))
        if folderList:
            for i, j in enumerate(folderList):
                # 所有文件夹的子节点也要一并删除
                list1, list2 = getChildren(request.session["id"], j)
                if list1:
                    for k in list1:
                        folderList.append(k)
                if list2:
                    for k in list2:
                        fileList.append(k)
            print("folder:", folderList)
            for i, v in enumerate(folderList):
                db = MysqlHelper()
                sql1 = "INSERT INTO sysite_deletedfolder (userId, folderId, Ddate) VALUES (%s, %s, %s)"
                res1 = db.insert(sql1, [request.session["id"], v, date])
                db = MysqlHelper()
                sql2 = "UPDATE sysite_folderuser SET status = %s WHERE folderId = %s"
                db.update(sql2, [1, int(v)])
        if fileList:
            for i, v in enumerate(fileList):
                db = MysqlHelper()
                sql = "INSERT INTO sysite_deletedfile (userId, fileId, Ddate) VALUES (%s, %s, %s)"
                res = db.insert(sql, [request.session["id"], v, date])
                db = MysqlHelper()
                sql3 = "UPDATE sysite_fileuser SET status = %s WHERE fileId = %s"
                db.update(sql3, [1, int(v)])
        data = 'success'
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# share 分享文件和文件夹
@csrf_exempt
def share(request):
    if request.method == 'POST':
        shareTo = request.POST.get('shareTo')
        folderList = json.loads(request.POST.get('folderList'))
        fileList = json.loads(request.POST.get('fileList'))
        date = time.strftime('%Y-%m-%d', time.localtime(time.time()))
        if folderList:
            for i, j in enumerate(folderList):
                # 所有文件夹的子节点也要一并分享
                list1, list2 = getChildren(request.session["id"], j)
                if list1:
                    for k in list1:
                        folderList.append(k)
                if list2:
                    for k in list2:
                        fileList.append(k)
            print("folder:", folderList)
            for i, v in enumerate(folderList):
                db = MysqlHelper()
                sql1 = "INSERT INTO sysite_folderuser (userId, folderId, dir, oDate) VALUES (%s, %s, %s, %s)"
                res1 = db.insert(sql1, [shareTo, v, shareTo, date])
        if fileList:
            for i, v in enumerate(fileList):
                db = MysqlHelper()
                sql = "INSERT INTO sysite_fileuser (userId, fileId, dir, oDate, mode) VALUES (%s, %s, %s, %s, %s)"
                res = db.insert(sql, [shareTo, v, shareTo, date, 1])
        data = 'success'
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# undo 复原删除的文件和文件夹
@csrf_exempt
def undo(request):
    if request.method == 'POST':
        folderList = json.loads(request.POST.get('folderList'))
        fileList = json.loads(request.POST.get('fileList'))
        date = time.strftime('%Y-%m-%d', time.localtime(time.time()))
        if folderList:
            for i, j in enumerate(folderList):
                # 所有文件夹的子节点也要一并复原
                list1, list2 = getChildren(request.session["id"], j)
                if list1:
                    for k in list1:
                        folderList.append(k)
                if list2:
                    for k in list2:
                        fileList.append(k)
            print("folder:", folderList)
            for i, v in enumerate(folderList):
                db = MysqlHelper()
                sql1 = "DELETE FROM sysite_deletedfolder WHERE userId = %s and folderId = %s"
                res1 = db.insert(sql1, [request.session["id"], v])
                db = MysqlHelper()
                sql2 = "UPDATE sysite_folderuser SET status = %s WHERE folderId = %s"
                db.update(sql2, [0, int(v)])
        if fileList:
            for i, v in enumerate(fileList):
                db = MysqlHelper()
                sql = "INSERT INTO sysite_deletedfile WHERE userId = %s and fileId = %s"
                res = db.insert(sql, [request.session["id"], v])
                db = MysqlHelper()
                sql3 = "UPDATE sysite_fileuser SET status = %s WHERE fileId = %s"
                db.update(sql3, [0, int(v)])
        data = 'success'
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# newOrEdit 新建或编辑文件
@csrf_exempt
def newOrEdit(request):
    base_url = 'media/' + str(request.session['id']) + '/'
    if request.method == 'POST':
        id = request.POST.get('id')
        name = request.POST.get('name')
        content = request.POST.get('content')
        dir = request.POST.get("dir")
        date = time.strftime('%Y-%m-%d', time.localtime(time.time()))

        db = MysqlHelper()
        sql = "SELECT * FROM sysite_file WHERE id = %s"
        params = [id]
        res = db.fetchone(sql, params)
        print(res)
        url = base_url + name + '.txt'

        # 编辑则重新写入文件，新建则新建文件
        with open(base_url + name + '.txt', 'w+') as f:
            f.write(content)

        size = getFileSize(base_url + name + '.txt')
        print(size)

        if res:
            # 编辑原有文件，需要改变大小
            db = MysqlHelper()
            sql3 = "UPDATE sysite_file SET name = %s, size = %s WHERE id = %s"
            db.update(sql3, [name, size, id])
            data = {"result": "success", "message": "编辑成功"}
        else:
            # 新建txt文件
            db = MysqlHelper()
            sql1 = "INSERT INTO sysite_file (name, type, author, time, size, url) VALUES (%s, %s, %s, %s, %s, %s)"
            params = [name, "txt", request.session['id'], date, size, url]
            res = db.insert(sql1, params)
            db = MysqlHelper()
            sql3 = "SELECT max(id) from sysite_file"
            new_id = db.fetchone(sql3, [])[0]
            # 插入关联表
            db = MysqlHelper()
            sql2 = "INSERT INTO sysite_fileuser (userId, fileId, dir, oDate) VALUES (%s, %s, %s, %s)"
            params = [request.session['id'], new_id, dir, date]
            res2 = db.insert(sql2, params)
            print(res2)
            data = {"result": "success", "message": "新建成功"}
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# 获取所有文件类型
@csrf_exempt
def getType(request):
    if request.method == 'GET':
        db = MysqlHelper()
        sql = "SELECT type, count(*) FROM sysite_file, sysite_fileuser WHERE userId = %s and fileId = id GROUP BY type"
        res = db.fetchall(sql, [request.session["id"]])
        if res:
            data = {"result": "success", "message": {}}
            for i, v in enumerate(res):
                data["message"][i] = {"type": v[0], "count": v[1]}
            print(data)
        else:
            data = {"result": "success", "message": "None"}
    return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# 根据类型获取某用户文件
@csrf_exempt
def getFileByType(request):
    if request.method == 'GET':
        type = request.GET.get("type")
        if type == "All":
            db = MysqlHelper()
            sql = "SELECT sysite_file.id, sysite_file.name, type, author, time, size , url, sysite_user.name, authority " \
                  "FROM sysite_file, sysite_fileuser, sysite_user, sysite_mode " \
                  "WHERE status != 1 and userId = %s and sysite_file.id = sysite_fileuser.fileId " \
                  "and sysite_file.author = sysite_user.id and sysite_mode.id = sysite_fileuser.mode"
            res = db.fetchall(sql, [request.session["id"]])
        else:
            db = MysqlHelper()
            sql = "SELECT sysite_file.id, sysite_file.name, type, author, time, size , url, sysite_user.name, authority " \
                  "FROM sysite_file, sysite_fileuser, sysite_user, sysite_mode " \
                  "WHERE status != 1 and userId = %s and sysite_file.id = sysite_fileuser.fileId and type = %s " \
                   "and sysite_file.author = sysite_user.id and sysite_mode.id = sysite_fileuser.mode"
            res = db.fetchall(sql, [request.session["id"], type])
            print(res)
        if res:
            data = {"result": "success", "message": {}}
            for i, v in enumerate(res):
                data["message"][i] = {'id': v[0], 'name': v[1], 'type': v[2], 'author': v[7],
                                      'time': v[4].isoformat(), 'size': v[5], 'url': v[6], 'mode': v[8], 'authorId': v[3]}
            # print(data)
        else:
            data = {"result": "None"}
    return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# 获取回收站
@csrf_exempt
def getDeleted(request):
    if request.method == 'GET':
        # dir = request.GET.get("dir")
        db = MysqlHelper()
        sql1 = "SELECT sysite_file.id, sysite_file.name, type, author, time, size , url, sysite_user.name, authority " \
              "FROM sysite_file, sysite_fileuser, sysite_user, sysite_mode " \
              "WHERE status = 1 and sysite_file.id = sysite_fileuser.fileId and userId = %s " \
               "and sysite_file.author = sysite_user.id and sysite_mode.id = sysite_fileuser.mode"
        params = [request.session["id"]]
        res1 = db.fetchall(sql1, params)
        db = MysqlHelper()
        sql2 = "SELECT sysite_folder.id, sysite_folder.name, author, time, sysite_user.name, authority " \
              "FROM sysite_folder, sysite_folderuser, sysite_user, sysite_mode " \
              "WHERE status = 1 and sysite_folder.id = sysite_folderuser.folderId and userId = %s " \
               "and sysite_folder.author = sysite_user.id and sysite_mode.id = sysite_folderuser.mode"
        params = [request.session['id']]
        res2 = db.fetchall(sql2, params)
        if res1 or res2:
            data = {"result": "success", "message": {"files": {}, "folders": {}}}
            if res1:
                for i, v in enumerate(res1):
                    data["message"]["files"][i] = {'id': v[0], 'name': v[1], 'type': v[2], 'author': v[7],
                                                   'time': v[4].isoformat(), 'size': v[5], 'url': v[6], 'mode': v[8], 'authorId': v[3]}
            if res2:
                for i, v in enumerate(res2):
                    data["message"]["folders"][i] = {'id': v[0], 'name': v[1], 'type': 'folder', 'author': v[4],
                                                     'time': v[3].isoformat(), 'mode': v[5], 'authorId': v[2]}
        else:
            data = {"result": "failed"}
    return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# 获取好友
@csrf_exempt
def getFriend(request):
    if request.method == 'GET':
        db = MysqlHelper()
        sql = "SELECT sysite_user.name, sysite_user.id " \
              "FROM (SELECT friendId FROM sysite_userfriend WHERE userId = %s) friend, sysite_user " \
              "WHERE friend.friendId = sysite_user.id"
        res = db.fetchall(sql, [request.session["id"]])
        if res:
            count = 0
            data = {"result": "success", "message": {}, "count": 0}
            for i, v in enumerate(res):
                data["message"][i] = {"name": v[0], "id": v[1]}
                count += 1
            data["count"] = count
        else:
            data = {"result": "success", "message": "None"}
    return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# 获取通知
@csrf_exempt
def getnews(request):
    if request.method == 'GET':
        db = MysqlHelper()
        sql = "SELECT id, sender, content " \
              "FROM sysite_message"
        res = db.fetchall(sql, [])
        if res:
            count = 0
            data = {"result": "success", "message": {}, "count": 0}
            for i, v in enumerate(res):
                data["message"][i] = {"id": v[0], "sender": v[1], "content": v[2]}
                count += 1
            data["count"] = count
        else:
            data = {"result": "success", "message": "None"}
    return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# 获取已用容量
@csrf_exempt
def getVolume(request):
    if request.method == 'GET':
        print(request.session['name'])
        db = MysqlHelper()
        sql = "SELECT sysite_user.id, Sum(sysite_file.size), volume, volume-Sum(sysite_file.size) " \
              "FROM sysite_fileuser, sysite_file, sysite_user " \
              "WHERE status != 1 and sysite_file.id = sysite_fileuser.fileId and sysite_user.id = sysite_fileuser.userId GROUP BY sysite_user.id"
        # sql = "SELECT sysite_user.id, Sum(sysite_file.size), volume, volume-Sum(sysite_file.size) " \
        #       "FROM (SELECT sysite_user.id FROM sysite_user CROSS JOIN sysite_fileuser), sysite_file,  " \
        #       "WHERE sysite_file.id = sysite_fileuser.fileId and sysite_user.id = sysite_fileuser.userId GROUP BY sysite_user.id"
        params = [request.session['id']]
        res = db.fetchall(sql, [])
        if res:
            data = {"result": "success", "message": {}}
            for i, v in enumerate(res):
                data["message"][i] = {"id": v[0], "used": '%.2f' % v[1], "volume": v[2], "left": v[3], "percent": '%.2f' % (float(v[1])/float(v[2]))}
        else:
            data = {"result": "failed"}
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# 获取某目录下所有子节点
@csrf_exempt
def getChildren(id, pid):
    list1 = []
    list2 = []
    db = MysqlHelper()
    sql = "select folderId from (select t1.folderId, if(find_in_set(dir, @pids) > 0, @pids := concat(@pids, ',', folderId), 0) " \
            "as ischild from (select folderId, dir from sysite_folderuser t where t.status = 0 and t.userId = %s order by dir, folderId) t1, " \
            "(select @pids :=%s) t2) t3 where ischild != 0"
    params = [id, pid]
    res = db.fetchall(sql, params)
    if res:
        for i in res:
            list1.append(i[0])
    db = MysqlHelper()
    sql1 = "select fileId from (select t1.fileId, if(find_in_set(dir, @pids) > 0, @pids := concat(@pids, ',', fileId), 0) " \
            "as ischild from (select fileId, dir from sysite_fileuser t where t.status = 0 and t.userId = %s order by dir, fileId) t1, " \
            "(select @pids :=%s) t2) t3 where ischild != 0"
    params = [id, pid]
    res1 = db.fetchall(sql1, params)
    if res1:
        for i in res1:
            list2.append(i[0])
    print("list2:", list2)
    return list1, list2


############## admin ######################
# 获取所有用户
@csrf_exempt
def getAllUser(request):
    if request.method == 'GET':
        db = MysqlHelper()
        sql = "SELECT id, password, mailbox, name, volume, level FROM sysite_user WHERE level!=0 ORDER BY id"
        params = []
        res = db.fetchall(sql, params)
        if res:
            data = {"result": "success", "message": {}}
            for i, v in enumerate(res):
                data["message"][i] = {"id": v[0], "password": v[1], "mailbox": v[2], "name": v[3], "volume": v[4], "level": v[5]}
        else:
            data = {"result": "failed"}
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# adminGetFile 管理员获取当前目录下文件和文件夹
@csrf_exempt
def adminGetFile(request):
    if request.method == 'GET':
        dir = request.GET.get("dir")
        uid = request.session["id"]
        db = MysqlHelper()
        sql1 = "SELECT sysite_file.id, sysite_file.name, type, author, time, size , url, sysite_user.name, authority " \
              "FROM sysite_file, sysite_fileuser, sysite_user, sysite_mode " \
              "WHERE status != 1 and sysite_file.id = sysite_fileuser.fileId " \
               "and dir = %s and sysite_file.author = sysite_user.id and sysite_mode.id = sysite_fileuser.mode"
        params = [dir]
        res1 = db.fetchall(sql1, params)
        db = MysqlHelper()
        sql2 = "SELECT sysite_folder.id, sysite_folder.name, author, time, sysite_user.name, authority " \
              "FROM sysite_folder, sysite_folderuser, sysite_user, sysite_mode " \
              "WHERE status != 1 and sysite_folder.id = sysite_folderuser.folderId " \
               "and dir = %s and sysite_folder.author = sysite_user.id and sysite_mode.id = sysite_folderuser.mode"
        params = [dir]
        res2 = db.fetchall(sql2, params)
        if res1 or res2:
            data = {"result": "success", "message": {"files": {}, "folders": {}}}
            if res1:
                for i, v in enumerate(res1):
                    data["message"]["files"][i] = {'id': v[0], 'name': v[1], 'type': v[2], 'author': v[7],
                                                   'time': v[4].isoformat(), 'size': v[5], 'url': v[6], 'mode': v[8], 'authorId': v[3]}
            if res2:
                for i, v in enumerate(res2):
                    data["message"]["folders"][i] = {'id': v[0], 'name': v[1], 'type': 'folder', 'author': v[4],
                                                     'time': v[3].isoformat(), 'mode': v[5], 'authorId': v[2]}
        else:
            data = {"result": "failed"}
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')


# adminMessage 管理员创建系统消息
@csrf_exempt
def adminMessage(request):
    if request.method == 'POST':
        content = request.POST.get("content")
        # date = time.strftime('%Y-%m-%d', time.localtime(time.time()))
        db = MysqlHelper()
        sql1 = "INSERT INTO sysite_message (sender, content) VALUES (%s, %s)"
        params = [request.session['id'], content]
        res = db.insert(sql1, params)
        if res:
            data = {"result": "success"}
        else:
            data = {"result": "failed"}
        return HttpResponse(json.dumps(data, cls=JSONEncoder), content_type='application/json')