from rest_framework import viewsets, permissions, status, decorators
from rest_framework.response import Response
from .models import Notification, SupportTicket
from .serializers import NotificationSerializer, SupportTicketSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @decorators.action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(read=True)
        return Response({"message": "All notifications marked as read."})

class SupportTicketViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SupportTicketSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return SupportTicket.objects.all().order_by('-created_at')
        return SupportTicket.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @decorators.action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reply(self, request, pk=None):
        ticket = self.get_object()
        reply_message = request.data.get('admin_reply')
        
        if not reply_message:
            return Response({"detail": "Reply message is required."}, status=status.HTTP_400_BAD_REQUEST)

        ticket.admin_reply = reply_message
        ticket.status = 'Closed'
        ticket.save()

        # Send a notification to the user
        Notification.objects.create(
            user=ticket.user,
            title=f"Reply to your ticket: {ticket.subject}",
            message=reply_message
        )

        serializer = self.get_serializer(ticket)
        return Response(serializer.data)
