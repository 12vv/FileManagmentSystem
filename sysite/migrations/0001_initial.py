# Generated by Django 2.0.5 on 2018-10-30 06:57

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='File',
            fields=[
                ('file_id', models.BigAutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=20)),
                ('type', models.CharField(max_length=10)),
                ('owner', models.CharField(max_length=20)),
                ('time', models.DateField()),
                ('size', models.CharField(max_length=10)),
                ('parent_dir', models.CharField(default='Home', max_length=30)),
                ('url', models.CharField(default='/', max_length=250)),
            ],
        ),
        migrations.CreateModel(
            name='Folder',
            fields=[
                ('fold_id', models.BigAutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=20)),
                ('type', models.CharField(max_length=10)),
                ('owner', models.CharField(max_length=20)),
                ('time', models.DateField()),
                ('parent_dir', models.CharField(default='Home', max_length=30)),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.CharField(max_length=20, primary_key=True, serialize=False)),
                ('mailbox', models.CharField(max_length=30)),
                ('password', models.CharField(max_length=200)),
            ],
        ),
    ]
