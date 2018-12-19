"""file_system URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from sysite import views

# from django.views.static import serve
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('', views.login_page, name='login_page'),
    path('main', views.main),
    path('admin', views.admin),
    path('login', views.login, name='login'),
    path('testUsername', views.id_confirm),
    path('testEmail', views.email_confirm),
    path('register', views.register),
    path('logout', views.logout),
    path('upload', views.upload),
    path('newFolder', views.newFolder),
    path('getFile', views.getFile),
    path('delete', views.delete),
    path('newOrEdit', views.newOrEdit),
    path('getType', views.getType),
    path('getFileByType', views.getFileByType),
    path('getDeleted', views.getDeleted),
    path('getVolume', views.getVolume),
    path('getChildren', views.getChildren),
    path('rename', views.rename),
    path('paste', views.paste),
    path('getNode', views.getNode),
    path('getAllUser', views.getAllUser),
    path('getFriend', views.getFriend),
    path('getnews', views.getnews),
    path('undo', views.undo),
    path('share', views.share),
    #ADMIN
    path('adminGetFile', views.adminGetFile),
    path('adminMessage', views.adminMessage),
    # path('media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
