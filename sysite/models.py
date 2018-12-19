from django.db import models

# Create your models here.


class User(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    mailbox = models.CharField(max_length=30)
    password = models.CharField(max_length=200)


class File(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=20)
    type = models.CharField(max_length=10)
    author = models.CharField(max_length=20)
    time = models.DateField()
    size = models.CharField(max_length=10)
    url = models.CharField(max_length=250, default='/')


class Folder(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=20)
    type = models.CharField(max_length=10)
    owner = models.CharField(max_length=20)
    time = models.DateField()
    parent_dir = models.CharField(max_length=30, default="Home")


class FileUser(models.Model):
    userId = models.ForeignKey(User, on_delete=models.CASCADE)
    fileId = models.ForeignKey(File, on_delete=models.CASCADE)
    dir = models.CharField(max_length=20)
    oDate = models.DateField()
    status = models.IntegerField()

    class Meta:
        unique_together = ("userId", "fileId")


# unused
# class FileDetail(models.Model):
#     id = models.CharField(max_length=20, primary_key=True)
#     name = models.CharField(max_length=20)
#     type = models.CharField(max_length=10)
#     owner = models.CharField(max_length=20)
#     time = models.DateField()
#     size = models.CharField(max_length=10)
#     parent_dir = models.CharField(max_length=30, default="Home")
#     url = models.CharField(max_length=250, default='/')
