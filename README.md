# IIF WFH Schedule Generator

A web application that generates random Work From Home (WFH) schedules for employees, ensuring fair distribution and following specific scheduling rules.

## Features

- **Smart Schedule Generation**: Creates 5-day WFH schedules with customizable days per person
- **Unique Pair Algorithm**: Special 2-day schedule mode that ensures no duplicate employee pairs
- **Animated Results**: Slot machine-style animation for engaging result display
- **Flexible Date Selection**: Optional start date picker with automatic Monday alignment
- **Copy to Clipboard**: Easy sharing of generated schedules
- **Teams Integration**: Direct webhook support for schedule notifications
- **Responsive Design**: Works on desktop and mobile devices

## Scheduling Rules

### General Rules
- Schedules are generated Monday through Friday
- Employees are distributed fairly across available days
- No employee appears on consecutive days when possible

### 2-Day Schedule Special Rules
When generating 2-day schedules per person:
- **Unique Pairs**: Each employee pair works together exactly once
- **Maximum Capacity**: Supports up to 10 employees (10 unique pairs from 5 days)
- **Optimal Distribution**: Uses combinatorial approach for maximum fairness

## Installation

### Prerequisites
- Modern web browser with JavaScript enabled
- Local web server (recommended for development)
   try one of these two options:
   1. Option 1. Use VS Code "Live Server" Extension (Recommended)
   ```
   1. Open VS Code.
   2. Go to the Extensions tab on the left side (or press Ctrl+Shift+X).
   3. Search for Live Server (by Ritwick Dey) and click install.4. Open your project folder in VS Code.
   5. Right-click your index.html file and choose Open with Live Server.
   6. Your browser will open a new tab at http://127.0.0.1:5500
   ```
   2. Option 2. If you have Python installed on your system, you can run this command in your terminal inside your project folder:
   - For Python 3: `python -m http.server 8000`
   - Then open http://localhost:8000 in your browser.

### Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd iif-random-name-picker
   ```

2. Serve the files using any local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Usage

### Basic Usage
1. **Enter Employee Names**: Add one name per line in the textarea
2. **Set WFH Days**: Choose how many days each person should work from home (1-5)
3. **Optional Start Date**: Select a specific week start date (defaults to next week)
4. **Generate Schedule**: Click "Generate Schedule" to create the schedule
5. **Copy Results**: Use "Copy Result to Clipboard" to share the schedule

### Example Configuration
```
Employee Names:
Agung
Nabila
Ikram
Khisan
Derry
Jo
Jafar
Rendelt
Pedro
Fathimah

WFH Days per Person: 2
```

### Teams Integration
To enable Teams notifications:
1. Set up a Teams webhook URL
2. Configure the `TEAMS_URL` environment variable (server-side implementation required)
3. The application will send generated schedules to the configured Teams channel

## Development

### File Structure
```
iif-random-name-picker/
├── index.html          # Main HTML structure
├── script.js           # Core JavaScript logic
├── style.css           # Styling and responsive design
├── iif-logo.png        # Application favicon
└── README.md           # This documentation
```

### Key Functions
- `generateSchedule()`: General schedule generation algorithm
- `generateScheduleForTwoDays()`: Special 2-day unique pair algorithm
- `getWorkWeek()`: Date calculation and Monday alignment
- `runSlotAnimation()`: Animated result display
- `sendToTeams()`: Teams webhook integration

### Customization
- **Color Scheme**: Modify CSS variables in `style.css`
- **Animation Timing**: Adjust `spinDuration` in `runSlotAnimation()`
- **Validation Rules**: Update constraints in `handleGeneration()`

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security Considerations

- **Teams Integration**: Webhook URL should be handled server-side (see TODO list)
- **Input Validation**: Client-side validation only (server-side validation recommended for production)
- **Data Persistence**: No data storage - all processing is client-side

## Troubleshooting

### Common Issues
1. **Schedule Generation Fails**: Check that employee names are properly formatted (one per line)
2. **Date Picker Issues**: Ensure browser supports HTML5 date input
3. **Animation Problems**: Disable animations if performance is an issue

### Error Messages
- "⚠️ Please enter valid names and a number of WFH days": Check input fields
- "❗WFH days per person cannot be more than 5": Reduce days per person
- "❗Cannot guarantee the 'unique pair' rule for more than 10 people": Reduce employee count for 2-day mode

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test with various employee counts
- Ensure responsive design compatibility

## License

This project is proprietary to IIF. All rights reserved.

## Support

For technical support or feature requests:
- Contact the development team
- Create an issue in the project repository
- Check the troubleshooting section above

## Version History

- **v1.0.0**: Initial release with core scheduling functionality
- **v1.1.0**: Added Teams integration and improved animations
- **v1.2.0**: Enhanced mobile responsiveness and accessibility

---

*Last updated: January 2026*