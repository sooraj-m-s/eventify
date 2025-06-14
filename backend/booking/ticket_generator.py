from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER
import qrcode, io
from .ticket_config import COLORS, FONTS, LAYOUT, QR_CONFIG, TICKET_CONTENT


class TicketGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=FONTS['title_size'],
            spaceAfter=8,
            alignment=TA_CENTER,
            textColor=HexColor(COLORS['primary']),
            fontName='Helvetica-Bold'
        )
        
        self.subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=self.styles['Normal'],
            fontSize=FONTS['subtitle_size'],
            spaceAfter=25,
            alignment=TA_CENTER,
            textColor=HexColor(COLORS['secondary']),
            fontName='Helvetica-Oblique'
        )
        
        self.header_style = ParagraphStyle(
            'CustomHeader',
            parent=self.styles['Heading2'],
            fontSize=FONTS['header_size'],
            spaceAfter=12,
            textColor=HexColor(COLORS['secondary']),
            fontName='Helvetica-Bold'
        )
        
        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontSize=FONTS['normal_size'],
            spaceAfter=6,
            fontName='Helvetica'
        )
        
        self.footer_style = ParagraphStyle(
            'Footer',
            parent=self.styles['Normal'],
            fontSize=FONTS['footer_size'],
            alignment=TA_CENTER,
            textColor=HexColor(COLORS['text_secondary']),
            fontName='Helvetica'
        )
        
        self.qr_label_style = ParagraphStyle(
            'QRLabel',
            parent=self.styles['Normal'],
            fontSize=FONTS['qr_label_size'],
            alignment=TA_CENTER,
            textColor=HexColor(COLORS['text_primary']),
            fontName='Helvetica-Bold',
            spaceAfter=8
        )
        
        self.bold_style = ParagraphStyle(
            'Bold',
            parent=self.styles['Normal'],
            fontSize=FONTS['normal_size'],
            fontName='Helvetica-Bold',
            textColor=HexColor(COLORS['text_primary'])
        )
    
    def generate_ticket_pdf(self, booking):
        buffer = io.BytesIO()
        
        # Create PDF document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=LAYOUT['page_margins']*inch,
            leftMargin=LAYOUT['page_margins']*inch,
            topMargin=LAYOUT['page_margins']*inch,
            bottomMargin=LAYOUT['page_margins']*inch
        )
        
        story = []
        story.extend(self._create_title_section())
        story.extend(self._create_main_content_section(booking))
        story.extend(self._create_booking_info_section(booking))
        story.extend(self._create_footer_section())
        doc.build(story)
        buffer.seek(0)
        
        return buffer
    
    def _create_title_section(self):
        return [
            Paragraph(TICKET_CONTENT['title'], self.title_style),
            Paragraph(TICKET_CONTENT['subtitle'], self.subtitle_style),
            Spacer(1, 10)
        ]
    
    def _create_main_content_section(self, booking):
        qr_section = self._create_qr_section(booking)
        
        # Create event details section
        event_details = [
            Paragraph(f"<b>Event:</b> {booking.event.title}", self.normal_style),
            Paragraph(f"<b>Category:</b> {booking.event.category.categoryName if booking.event.category else 'N/A'}", self.normal_style),
            Paragraph(f"<b>Date:</b> {booking.event.date.strftime('%B %d, %Y')}", self.normal_style),
            Paragraph(f"<b>Time:</b> {booking.event.time.strftime('%I:%M %p')}", self.normal_style),
            Paragraph(f"<b>Location:</b> {booking.event.location or 'TBA'}", self.normal_style),
            Paragraph(f"<b>Hosted By:</b> {booking.event.hostedBy.full_name}", self.normal_style),
        ]
        
        # Create main layout table
        main_data = [
            [TICKET_CONTENT['sections']['event_details'], ''],
            [event_details, qr_section]
        ]
        
        col_widths = [width*inch for width in LAYOUT['table_col_widths']['main']]
        main_table = Table(main_data, colWidths=col_widths)
        main_table.setStyle(self._get_main_table_style())
        
        return [main_table, Spacer(1, 30)]
    
    def _create_qr_section(self, booking):
        qr_code = self._generate_qr_code(booking)
        
        # Create QR section with border and styling
        qr_data = [
            [Paragraph("SCAN TO VERIFY", self.qr_label_style)],
            [qr_code],
            [Paragraph("Valid Entry Pass", self.qr_label_style)]
        ]
        
        qr_table = Table(qr_data, colWidths=[LAYOUT['qr_section_width']*inch])
        qr_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, -1), HexColor(COLORS['qr_bg'])),
            ('BOX', (0, 0), (-1, -1), 2, HexColor(COLORS['primary'])),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, HexColor(COLORS['qr_border'])),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('ROUNDEDCORNERS', [5, 5, 5, 5]),
        ]))
        
        return qr_table
    
    def _create_booking_info_section(self, booking):
        booking_data = [
            ['Booking ID', str(booking.booking_id)],
            ['Booking Name', booking.booking_name],
            ['Booking Date', booking.booking_date.strftime('%B %d, %Y at %I:%M %p')],
            ['Payment Status', booking.payment_status.title()],
            ['Amount Paid', f"Rs.{booking.total_price}"],
            ['Payment ID', booking.payment_id or 'N/A'],
            ['Payment Date', booking.payment_date.strftime('%B %d, %Y at %I:%M %p') if booking.payment_date else 'N/A']
        ]
        
        if booking.notes:
            booking_data.append(['Notes', booking.notes])
        
        col_widths = [width*inch for width in LAYOUT['table_col_widths']['booking']]
        booking_table = Table(booking_data, colWidths=col_widths)
        booking_table.setStyle(self._get_booking_table_style())
        
        return [
            Paragraph(TICKET_CONTENT['sections']['booking_info'], self.header_style),
            booking_table,
            Spacer(1, 30)
        ]
    
    def _create_footer_section(self):
        return [
            Spacer(1, 30),
            Paragraph(TICKET_CONTENT['footer_text'], self.footer_style),
            Paragraph(TICKET_CONTENT['powered_by'], self.footer_style)
        ]
    
    def _generate_qr_code(self, booking):
        qr_data = f"BOOKING:{booking.booking_id}|EVENT:{booking.event.eventId}|USER:{booking.user.user_id}"
        
        qr = qrcode.QRCode(
            version=QR_CONFIG['version'],
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=QR_CONFIG['box_size'],
            border=QR_CONFIG['border'],
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Create QR code image with custom colors
        qr_img = qr.make_image(
            fill_color=QR_CONFIG['fill_color'], 
            back_color=QR_CONFIG['back_color']
        )
        
        # Convert to bytes
        img_buffer = io.BytesIO()
        qr_img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        # Create ReportLab Image
        qr_image = Image(img_buffer, width=LAYOUT['qr_code_size']*inch, height=LAYOUT['qr_code_size']*inch)
        
        return qr_image
    
    def _get_main_table_style(self):
        return TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor(COLORS['background'])),
            ('TEXTCOLOR', (0, 0), (-1, 0), HexColor(COLORS['primary'])),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 1), (1, 1), 'CENTER'),  # Center QR section
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), FONTS['table_size'] + 2),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 1), (-1, -1), 15),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 15),
            ('LEFTPADDING', (0, 0), (-1, -1), 15),
            ('RIGHTPADDING', (0, 0), (-1, -1), 15),
            ('GRID', (0, 0), (-1, -1), 1, HexColor(COLORS['border'])),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor(COLORS['table_bg_2'])]),
            ('ROUNDEDCORNERS', [8, 8, 8, 8]),
        ])
    
    def _get_booking_table_style(self):
        return TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), HexColor(COLORS['table_bg_1'])),
            ('TEXTCOLOR', (0, 0), (0, -1), HexColor(COLORS['text_primary'])),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), FONTS['table_size']),
            ('GRID', (0, 0), (-1, -1), 1, HexColor(COLORS['border'])),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [HexColor(COLORS['table_bg_1']), HexColor(COLORS['table_bg_2'])]),
            ('ROUNDEDCORNERS', [5, 5, 5, 5]),
        ])


class TicketPermissions:
    @staticmethod
    def can_download_ticket(booking):
        from django.utils import timezone
        
        if booking.payment_status != 'confirmed':
            return {
                "allowed": False,
                "reason": "Ticket can only be downloaded after successful payment"
            }
        
        if booking.event.is_completed or booking.event.date < timezone.now().date():
            return {
                "allowed": False,
                "reason": "Ticket cannot be downloaded after event completion"
            }
        
        if booking.is_booking_cancelled:
            return {
                "allowed": False,
                "reason": "Cannot download ticket for cancelled booking"
            }
        
        return {
            "allowed": True,
            "reason": "Ticket download allowed"
        }
    
    @staticmethod
    def can_cancel_booking(booking):
        from django.utils import timezone
        
        if not booking.event.cancellationAvailable:
            return {
                "allowed": False,
                "reason": "Cancellation not available for this event"
            }
        
        if booking.is_booking_cancelled:
            return {
                "allowed": False,
                "reason": "Booking is already cancelled"
            }
        
        if booking.event.date < timezone.now().date():
            return {
                "allowed": False,
                "reason": "Cannot cancel bookings for past events"
            }
        
        if booking.event.is_completed:
            return {
                "allowed": False,
                "reason": "Cannot cancel bookings for completed events"
            }
        
        return {
            "allowed": True,
            "reason": "Booking cancellation allowed"
        }

