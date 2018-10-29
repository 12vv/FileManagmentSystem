from django.db import models

# Create your models here.

class User(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    mailbox = models.CharField(max_length=30)
    password = models.CharField(max_length=200)


class File(models.Model):
    name = models.CharField(primary_key=True, max_length=20)
    type = models.CharField(max_length=10)
    owner = models.CharField(max_length=20)
    time = models.DateField()
    size = models.CharField(max_length=10)
    parent_dir = models.CharField(max_length=30, default="Home")

