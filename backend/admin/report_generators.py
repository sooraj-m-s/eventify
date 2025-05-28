import io
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER


class ExcelReportGenerator:
    def generate_revenue_report(self, report_data):
        buffer = io.BytesIO()
        
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            self._create_summary_sheet(writer, report_data)
            self._create_bookings_sheet(writer, report_data)
            self._create_organizer_revenue_sheet(writer, report_data)
            self._create_category_revenue_sheet(writer, report_data)
            self._create_daily_revenue_sheet(writer, report_data)
        
        buffer.seek(0)
        return buffer
    
    def _create_summary_sheet(self, writer, report_data):
        summary = report_data['summary']
        
        summary_data = [
            ['Report Generated', summary['generated_at'].strftime('%Y-%m-%d %H:%M:%S')],
            ['Report Period Start', summary['report_period']['start_date']],
            ['Report Period End', summary['report_period']['end_date']],
            ['', ''],
            ['Total Events', summary['total_events']],
            ['Total Revenue', f"₹{summary['total_revenue']:,.2f}"],
            ['Total Bookings', summary['total_bookings']],
        ]
        
        df = pd.DataFrame(summary_data, columns=['Metric', 'Value'])
        df.to_excel(writer, sheet_name='Summary', index=False)
    
    def _create_bookings_sheet(self, writer, report_data):
        if report_data['bookings']:
            df = pd.DataFrame(report_data['bookings'])
            df.columns = [
                'Booking ID', 'Booking Name', 'Amount', 'Booking Date',
                'Event Title', 'Organizer', 'Category', 'Event Date',
                'Location', 'Payment ID', 'Payment Date'
            ]
            df.to_excel(writer, sheet_name='Detailed Bookings', index=False)
    
    def _create_organizer_revenue_sheet(self, writer, report_data):
        if report_data['organizer_revenue']:
            df = pd.DataFrame(report_data['organizer_revenue'])
            df.columns = ['Organizer Name', 'Email', 'Total Revenue', 'Total Bookings', 'Total Events']
            df.to_excel(writer, sheet_name='Revenue by Organizer', index=False)
    
    def _create_category_revenue_sheet(self, writer, report_data):
        if report_data['category_revenue']:
            df = pd.DataFrame(report_data['category_revenue'])
            df.columns = ['Category', 'Total Revenue', 'Total Bookings', 'Total Events']
            df.to_excel(writer, sheet_name='Revenue by Category', index=False)
    
    def _create_daily_revenue_sheet(self, writer, report_data):
        if report_data['daily_revenue']:
            df = pd.DataFrame(report_data['daily_revenue'])
            df.columns = ['Date', 'Revenue', 'Bookings Count']
            df.to_excel(writer, sheet_name='Daily Revenue', index=False)


class PDFReportGenerator:
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
        
        story.append(Paragraph("Eventify Revenue Report", self.title_style))
        story.append(Spacer(1, 20))
        story.extend(self._create_summary_section(report_data))
        story.extend(self._create_organizer_section(report_data))
        story.extend(self._create_category_section(report_data))
        
        doc.build(story)
        buffer.seek(0)
        
        return buffer
    
    def _create_summary_section(self, report_data):
        summary = report_data['summary']
        
        elements = [
            Paragraph("Summary", self.header_style),
        ]
        
        summary_data = [
            ['Report Period', f"{summary['report_period']['start_date']} to {summary['report_period']['end_date']}"],
            ['Total Events', str(summary['total_events'])],
            ['Total Revenue', f"₹{summary['total_revenue']:,.2f}"],
            ['Total Bookings', str(summary['total_bookings'])],
            ['Generated At', summary['generated_at'].strftime('%Y-%m-%d %H:%M:%S')],
        ]
        
        table = Table(summary_data, colWidths=[2*inch, 3*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.extend([table, Spacer(1, 30)])
        return elements
    
    def _create_organizer_section(self, report_data):
        elements = [
            Paragraph("Revenue by Organizer", self.header_style),
        ]
        
        if report_data['organizer_revenue']:
            headers = ['Organizer', 'Email', 'Revenue', 'Bookings', 'Events']
            data = [headers]
            
            for org in report_data['organizer_revenue'][:10]:
                data.append([
                    org['event__hostedBy__full_name'],
                    org['event__hostedBy__email'],
                    f"₹{org['total_revenue']:,.2f}",
                    str(org['total_bookings']),
                    str(org['total_events'])
                ])
            
            table = Table(data, colWidths=[1.5*inch, 2*inch, 1.2*inch, 0.8*inch, 0.8*inch])
            table.setStyle(self._get_table_style())
            elements.extend([table, Spacer(1, 30)])
        
        return elements
    
    def _create_category_section(self, report_data):
        elements = [
            Paragraph("Revenue by Category", self.header_style),
        ]
        
        if report_data['category_revenue']:
            headers = ['Category', 'Revenue', 'Bookings', 'Events']
            data = [headers]
            
            for cat in report_data['category_revenue']:
                data.append([
                    cat['event__category__categoryName'],
                    f"₹{cat['total_revenue']:,.2f}",
                    str(cat['total_bookings']),
                    str(cat['total_events'])
                ])
            
            table = Table(data, colWidths=[2*inch, 1.5*inch, 1*inch, 1*inch])
            table.setStyle(self._get_table_style())
            elements.extend([table, Spacer(1, 30)])
        
        return elements
    
    def _get_table_style(self):
        return TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
        ])

