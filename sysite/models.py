from django.db import models

# Create your models here.

class User(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    mailbox = models.CharField(max_length=30)
    password = models.CharField(max_length=200)