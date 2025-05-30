import io
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER


class OrganizerExcelGenerator:
    def generate_revenue_report(self, report_data):
        buffer = io.BytesIO()
        
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            self._create_summary_sheet(writer, report_data)
            self._create_bookings_sheet(writer, report_data)
            self._create_event_revenue_sheet(writer, report_data)
            self._create_revenue_split_sheet(writer, report_data)
        
        buffer.seek(0)
        return buffer
    
    def _create_summary_sheet(self, writer, report_data):
        summary = report_data['summary']
        
        summary_data = [
            ['Organizer Revenue Report', ''],
            ['', ''],
            ['Organizer Name', summary['organizer_name']],
            ['Organizer Email', summary['organizer_email']],
            ['Report Generated', summary['generated_at'].strftime('%Y-%m-%d %H:%M:%S')],
            ['', ''],
            ['REVENUE SUMMARY', ''],
            ['Total Bookings', summary['total_bookings']],
            ['Total Revenue', f"₹{summary['total_revenue']:,.2f}"],
            ['Your Share (90%)', f"₹{summary['organizer_revenue']:,.2f}"],
            ['Platform Fee (10%)', f"₹{summary['platform_fee']:,.2f}"],
            ['', ''],
            ['REVENUE SPLIT', ''],
            ['Organizer Percentage', f"{summary['revenue_split']['organizer']}%"],
            ['Platform Percentage', f"{summary['revenue_split']['platform']}%"],
        ]
        
        df = pd.DataFrame(summary_data, columns=['Metric', 'Value'])
        df.to_excel(writer, sheet_name='Summary', index=False)
    
    def _create_bookings_sheet(self, writer, report_data):
        if report_data['bookings']:
            bookings_df = pd.DataFrame(report_data['bookings'])
            
            column_mapping = {
                'booking_id': 'Booking ID',
                'booking_name': 'Booking Name',
                'total_price': 'Total Amount',
                'organizer_amount': 'Your Share (90%)',
                'platform_fee': 'Platform Fee (10%)',
                'booking_date': 'Booking Date',
                'payment_date': 'Payment Date',
                'payment_status': 'Payment Status',
                'event__title': 'Event Title',
                'event__date': 'Event Date',
                'user__full_name': 'Customer Name',
                'user__email': 'Customer Email',
                'notes': 'Notes'
            }
            
            bookings_df = bookings_df.rename(columns=column_mapping)
            bookings_df.to_excel(writer, sheet_name='Detailed Bookings', index=False)
    
    def _create_event_revenue_sheet(self, writer, report_data):
        if report_data['event_revenue']:
            events_df = pd.DataFrame(report_data['event_revenue'])
            
            column_mapping = {
                'event__title': 'Event Title',
                'event__date': 'Event Date',
                'event__pricePerTicket': 'Ticket Price',
                'total_bookings': 'Total Bookings',
                'total_revenue': 'Total Revenue',
                'organizer_revenue': 'Your Share (90%)',
                'platform_fee': 'Platform Fee (10%)'
            }
            
            events_df = events_df.rename(columns=column_mapping)
            events_df.to_excel(writer, sheet_name='Revenue by Event', index=False)
    
    def _create_revenue_split_sheet(self, writer, report_data):
        summary = report_data['summary']
        
        split_data = [
            ['Revenue Split Analysis', '', ''],
            ['', '', ''],
            ['Component', 'Amount (₹)', 'Percentage'],
            ['Total Revenue', f"{summary['total_revenue']:,.2f}", '100%'],
            ['Your Share', f"{summary['organizer_revenue']:,.2f}", '90%'],
            ['Platform Fee', f"{summary['platform_fee']:,.2f}", '10%'],
            ['', '', ''],
            ['Note:', 'Platform fee covers payment processing,', ''],
            ['', 'hosting, and customer support services.', ''],
        ]
        
        df = pd.DataFrame(split_data, columns=['Component', 'Amount', 'Percentage'])
        df.to_excel(writer, sheet_name='Revenue Split Analysis', index=False)


class OrganizerPDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#2E86AB')
        )
        self.header_style = ParagraphStyle(
            'CustomHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            textColor=colors.HexColor('#A23B72')
        )
        self.subheader_style = ParagraphStyle(
            'CustomSubHeader',
            parent=self.styles['Heading3'],
            fontSize=14,
            spaceAfter=8,
            textColor=colors.HexColor('#333333')
        )
    
    def generate_revenue_report(self, report_data):
        buffer = io.BytesIO()
        
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=0.5*inch,
            leftMargin=0.5*inch,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch
        )
        
        story = []
        
        story.append(Paragraph("Organizer Revenue Report", self.title_style))
        story.append(Spacer(1, 20))
        
        story.extend(self._create_organizer_info_section(report_data))
        story.extend(self._create_revenue_summary_section(report_data))
        story.extend(self._create_event_breakdown_section(report_data))
        story.extend(self._create_revenue_split_section(report_data))
        
        doc.build(story)
        buffer.seek(0)
        
        return buffer
    
    def _create_organizer_info_section(self, report_data):
        summary = report_data['summary']
        
        elements = [
            Paragraph("Organizer Information", self.header_style),
        ]
        
        info_data = [
            ['Organizer Name', summary['organizer_name']],
            ['Email', summary['organizer_email']],
            ['Generated At', summary['generated_at'].strftime('%Y-%m-%d %H:%M:%S')],
        ]
        
        table = Table(info_data, colWidths=[2*inch, 4*inch])
        table.setStyle(self._get_info_table_style())
        
        elements.extend([table, Spacer(1, 30)])
        return elements
    
    def _create_revenue_summary_section(self, report_data):
        summary = report_data['summary']
        
        elements = [
            Paragraph("Revenue Summary", self.header_style),
        ]
        
        summary_data = [
            ['Metric', 'Value'],
            ['Total Bookings', str(summary['total_bookings'])],
            ['Total Revenue', f"₹{summary['total_revenue']:,.2f}"],
            ['Your Share (90%)', f"₹{summary['organizer_revenue']:,.2f}"],
            ['Platform Fee (10%)', f"₹{summary['platform_fee']:,.2f}"],
        ]
        
        table = Table(summary_data, colWidths=[2.5*inch, 2.5*inch])
        table.setStyle(self._get_summary_table_style())
        
        elements.extend([table, Spacer(1, 30)])
        return elements
    
    def _create_event_breakdown_section(self, report_data):
        elements = [
            Paragraph("Revenue by Event", self.header_style),
        ]
        
        if report_data['event_revenue']:
            headers = ['Event', 'Date', 'Bookings', 'Total Revenue', 'Your Share']
            data = [headers]
            
            for event in report_data['event_revenue'][:10]:  # Top 10 events
                data.append([
                    event['event__title'][:30] + '...' if len(event['event__title']) > 30 else event['event__title'],
                    str(event['event__date']),
                    str(event['total_bookings']),
                    f"₹{event['total_revenue']:,.2f}",
                    f"₹{float(event['organizer_revenue']):,.2f}"
                ])
            
            table = Table(data, colWidths=[2*inch, 1*inch, 0.8*inch, 1.2*inch, 1.2*inch])
            table.setStyle(self._get_event_table_style())
            elements.extend([table, Spacer(1, 30)])
        
        return elements
    
    def _create_revenue_split_section(self, report_data):
        summary = report_data['summary']
        
        elements = [
            Paragraph("Revenue Split Details", self.header_style),
            Paragraph("Understanding Your Revenue Share", self.subheader_style),
        ]
        
        split_data = [
            ['Component', 'Amount', 'Percentage'],
            ['Total Revenue', f"₹{summary['total_revenue']:,.2f}", '100%'],
            ['Your Share', f"₹{summary['organizer_revenue']:,.2f}", '90%'],
            ['Platform Fee', f"₹{summary['platform_fee']:,.2f}", '10%'],
        ]
        
        table = Table(split_data, colWidths=[2*inch, 2*inch, 1.5*inch])
        table.setStyle(self._get_split_table_style())
        
        elements.extend([
            table,
            Spacer(1, 20),
            Paragraph(
                "<b>Note:</b> The 10% platform fee covers payment processing, hosting infrastructure, "
                "customer support, and platform maintenance services.",
                self.styles['Normal']
            )
        ])
        
        return elements
    
    def _get_info_table_style(self):
        return TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F8F9FA')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ])
    
    def _get_summary_table_style(self):
        return TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E86AB')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
        ])
    
    def _get_event_table_style(self):
        return TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#A23B72')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
        ])
    
    def _get_split_table_style(self):
        return TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F18F01')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
        ])

