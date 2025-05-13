from django.urls import path
from .views import CategoryListView, CategoryUpdateView


urlpatterns = [
    path('', CategoryListView.as_view(), name='category-list'),
    path('update/<str:category_id>/', CategoryUpdateView.as_view(), name='category-update'),
]

