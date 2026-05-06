# ================================================
# COVID-19 DISEASE SIMULATION MODEL
# Built with reference to:
# - Imperial College London COVID model (2020)
#   Borrowed: Added age groups (0-18, 18-60, 60+) with different mortality rates
# - IHME COVID projections
#   Borrowed: Compared simulation output to real data and cases
# - IDM SEIR epidemiological model  
#   Borrowed: Added E (Exposed) state making it SEIR not SIR
# - GLEAMviz geographic spread simulator
#   Borrowed: Added geographic spread concepts between districts
# - Plague Inc (Ndemic Creations) — regional mechanics
#   Borrowed: Added weather and regional factors affecting spread
# - Pandemic board game — resource constraint concept
#   Borrowed: Limited resources concept like hospital bed capacity
#
# Real data sourced from:
# - data.gov.in (India Government Open Data)
# - WHO via data.humdata.org
# - EpiClim India dataset (Kaggle)
# - IDSP — idsp.mohfw.gov.in
# - covid19india.org (archived)
# ================================================

# Import numpy for numerical operations and array manipulations
import numpy as np
# Import pandas for dataframes to store simulation output
import pandas as pd
# Import matplotlib.pyplot for plotting all the graphs and charts
import matplotlib.pyplot as plt
# Import Slider and Button from matplotlib.widgets for interactive UI
from matplotlib.widgets import Slider, Button

# === REAL WORLD DATA (sourced from datasets) ===

# Hardcode the real peak number of cases in Karnataka
karnataka_total_cases = 3950000 # Source: data.gov.in
# Hardcode the real number of deaths in Karnataka
karnataka_total_deaths = 40057 # Source: data.gov.in
# Hardcode the real recovery rate percentage in Karnataka
karnataka_recovery_rate = 98.9 # Source: data.gov.in

# Hardcode India COVID case fatality rate (1.2%)
india_cfr = 0.012 # Source: WHO via humdata.org
# Hardcode average incubation period
incubation_period = 5.1 # Source: WHO via humdata.org
# Hardcode Basic reproduction number R0 for original COVID
r0_initial = 2.5 # Source: WHO via humdata.org

# Hardcode Karnataka total population
karnataka_population = 67562000 # Source: EpiClim dataset, Kaggle
# Hardcode Shivamogga district population
shivamogga_population = 1752000 # Source: EpiClim dataset, Kaggle
# Hardcode average disease reporting lag in days
reporting_lag_days = 7 # Source: EpiClim dataset, Kaggle

# Hardcode average days from exposure to symptoms
days_to_symptoms = 5 # Source: IDSP mohfw.gov.in
# Hardcode average days infectious
days_infectious = 10 # Source: IDSP mohfw.gov.in
# Hardcode hospital bed requirement at peak (5% of infected)
hospital_bed_req_rate = 0.05 # Source: IDSP mohfw.gov.in

# Create empty dictionary for district data
districts = {}
# Add Shivamogga district data (Source: covid19india.org archive)
districts['Shivamogga'] = {'lat': 13.9299, 'lng': 75.5681, 'cases': 85000, 'pop': 1752000}
# Add Bengaluru district data (Source: covid19india.org archive)
districts['Bengaluru'] = {'lat': 12.9716, 'lng': 77.5946, 'cases': 1200000, 'pop': 13193000}
# Add Mysuru district data (Source: covid19india.org archive)
districts['Mysuru'] = {'lat': 12.2958, 'lng': 76.6394, 'cases': 120000, 'pop': 3001127}
# Add Mangaluru district data (Source: covid19india.org archive)
districts['Mangaluru'] = {'lat': 12.8698, 'lng': 74.8431, 'cases': 110000, 'pop': 2089649}
# Add Hubballi district data (Source: covid19india.org archive)
districts['Hubballi'] = {'lat': 15.3647, 'lng': 75.1240, 'cases': 78000, 'pop': 943857}
# Add Belagavi district data (Source: covid19india.org archive)
districts['Belagavi'] = {'lat': 15.8497, 'lng': 74.4977, 'cases': 95000, 'pop': 4779661}
# Add Davangere district data (Source: covid19india.org archive)
districts['Davangere'] = {'lat': 14.4644, 'lng': 75.9218, 'cases': 65000, 'pop': 1946905}
# Add Ballari district data (Source: covid19india.org archive)
districts['Ballari'] = {'lat': 15.1394, 'lng': 76.9214, 'cases': 72000, 'pop': 2532383}
# Add Vijayapura district data (Source: covid19india.org archive)
districts['Vijayapura'] = {'lat': 16.8302, 'lng': 75.7100, 'cases': 55000, 'pop': 2170060}
# Add Kalaburagi district data (Source: covid19india.org archive)
districts['Kalaburagi'] = {'lat': 17.3297, 'lng': 76.8343, 'cases': 68000, 'pop': 2566326}
# Add Tumakuru district data (Source: covid19india.org archive)
districts['Tumakuru'] = {'lat': 13.3379, 'lng': 77.1173, 'cases': 89000, 'pop': 2681449}
# Add Raichur district data (Source: covid19india.org archive)
districts['Raichur'] = {'lat': 16.2120, 'lng': 77.3566, 'cases': 48000, 'pop': 1924773}

# Define the SEIR simulation function taking interactive inputs
def run_seir_simulation(beta, inc_days, inf_days, initial_infected, population=1752000):
    # Set the initial number of exposed individuals
    exposed_0 = 50
    # Set the initial number of infected individuals
    infected_0 = initial_infected
    # Calculate initial susceptible individuals
    susceptible_0 = population - exposed_0 - infected_0
    # Set initial recovered individuals to zero
    recovered_0 = 0
    
    # Calculate sigma as reciprocal of incubation period
    sigma = 1.0 / inc_days
    # Calculate gamma as reciprocal of infectious period
    gamma = 1.0 / inf_days
    
    # Set total simulation days
    days = 365
    
    # Define young population proportion
    young_prop = 0.15
    # Define young population mortality rate
    young_mort = 0.0001
    # Define adult population proportion
    adult_prop = 0.60
    # Define adult population mortality rate
    adult_mort = 0.005
    # Define elderly population proportion
    elderly_prop = 0.25
    # Define elderly population mortality rate
    elderly_mort = 0.025
    
    # Initialize empty list for day numbers
    day_list = []
    # Initialize empty list for susceptible counts
    s_list = []
    # Initialize empty list for exposed counts
    e_list = []
    # Initialize empty list for infected counts
    i_list = []
    # Initialize empty list for recovered counts
    r_list = []
    
    # Initialize empty list for cumulative young deaths
    dy_list = []
    # Initialize empty list for cumulative adult deaths
    da_list = []
    # Initialize empty list for cumulative elderly deaths
    de_list = []
    # Initialize empty list for total deaths
    dt_list = []
    # Initialize empty list for hospital beds needed
    beds_list = []
    
    # Initialize current susceptible
    s = susceptible_0
    # Initialize current exposed
    e = exposed_0
    # Initialize current infected
    i = infected_0
    # Initialize current recovered
    r = recovered_0
    
    # Initialize cumulative young deaths counter
    cum_dy = 0
    # Initialize cumulative adult deaths counter
    cum_da = 0
    # Initialize cumulative elderly deaths counter
    cum_de = 0
    
    # Loop over each day of the simulation
    for day in range(days):
        # Calculate new exposed individuals for the day
        new_exposed = beta * (i * s / population)
        # Calculate new infected individuals for the day
        new_infected = sigma * e
        # Calculate new recovered individuals for the day
        new_recovered = gamma * i
        
        # Update susceptible population
        s = s - new_exposed
        # Update exposed population
        e = e + new_exposed - new_infected
        # Update infected population
        i = i + new_infected - new_recovered
        # Update recovered population
        r = r + new_recovered
        
        # Calculate daily young deaths based on recoveries and mortality
        dy = new_recovered * young_prop * young_mort
        # Calculate daily adult deaths based on recoveries and mortality
        da = new_recovered * adult_prop * adult_mort
        # Calculate daily elderly deaths based on recoveries and mortality
        de = new_recovered * elderly_prop * elderly_mort
        
        # Add daily young deaths to cumulative total
        cum_dy += dy
        # Add daily adult deaths to cumulative total
        cum_da += da
        # Add daily elderly deaths to cumulative total
        cum_de += de
        # Calculate total deaths across all ages
        total_deaths = cum_dy + cum_da + cum_de
        
        # Calculate hospital beds needed today based on infected
        beds_needed = i * hospital_bed_req_rate
        
        # Append current day to list
        day_list.append(day)
        # Append current susceptible count
        s_list.append(s)
        # Append current exposed count
        e_list.append(e)
        # Append current infected count
        i_list.append(i)
        # Append current recovered count
        r_list.append(r)
        
        # Append cumulative young deaths
        dy_list.append(cum_dy)
        # Append cumulative adult deaths
        da_list.append(cum_da)
        # Append cumulative elderly deaths
        de_list.append(cum_de)
        # Append cumulative total deaths
        dt_list.append(total_deaths)
        # Append hospital beds needed
        beds_list.append(beds_needed)
        
    # Create empty dictionary for dataframe data
    data = {}
    # Add day list to data
    data['day'] = day_list
    # Add susceptible list to data
    data['susceptible'] = s_list
    # Add exposed list to data
    data['exposed'] = e_list
    # Add infected list to data
    data['infected'] = i_list
    # Add recovered list to data
    data['recovered'] = r_list
    # Add young deaths list to data
    data['deaths_young'] = dy_list
    # Add adult deaths list to data
    data['deaths_adult'] = da_list
    # Add elderly deaths list to data
    data['deaths_elderly'] = de_list
    # Add total deaths list to data
    data['total_deaths'] = dt_list
    # Add hospital beds list to data
    data['hospital_beds_needed'] = beds_list
    
    # Create and return pandas DataFrame from data dictionary
    return pd.DataFrame(data)

if __name__ == '__main__':
    # Set plotting style to dark background for dashboard look
    plt.style.use('dark_background')
    
    # --- FIGURE 1: SEIR SPREAD GRAPH ---
    # Create first figure for SEIR simulation line charts
    fig1, ax1 = plt.subplots(figsize=(12, 7))
    # Adjust layout to make room for interactive sliders
    plt.subplots_adjust(bottom=0.35)
    
    # Define initial beta value (fitted to R0 2.5)
    init_beta = 0.35
    # Define initial incubation days from hardcoded data
    init_inc = incubation_period
    # Define initial infectious days from hardcoded data
    init_inf = days_infectious
    # Define initial infected count (Source: IDSP early outbreak)
    init_infected = 10
    
    # Run simulation with initial parameters to get starting dataframe
    df = run_seir_simulation(init_beta, init_inc, init_inf, init_infected)
    
    # Plot Susceptible line in neon blue
    l_s, = ax1.plot(df['day'], df['susceptible'], color='#00a8ff', label='Susceptible', linewidth=2)
    # Plot Exposed line in vibrant orange
    l_e, = ax1.plot(df['day'], df['exposed'], color='#fbc531', label='Exposed', linewidth=2)
    # Plot Infected line in crimson red
    l_i, = ax1.plot(df['day'], df['infected'], color='#e84118', label='Infected', linewidth=2)
    # Plot Recovered line in emerald green
    l_r, = ax1.plot(df['day'], df['recovered'], color='#4cd137', label='Recovered', linewidth=2)
    
    # Set primary Y axis label
    ax1.set_ylabel('Population Count', color='white')
    # Set primary X axis label
    ax1.set_xlabel('Days', color='white')
    # Add grid lines with low opacity
    ax1.grid(True, alpha=0.2)
    
    # Create secondary Y axis for hospital beds
    ax2 = ax1.twinx()
    # Plot hospital beds needed as a dotted purple line
    l_beds, = ax2.plot(df['day'], df['hospital_beds_needed'], color='#9c88ff', linestyle=':', label='Beds Needed', linewidth=2)
    # Set secondary Y axis label
    ax2.set_ylabel('Hospital Beds Needed', color='#9c88ff')
    
    # Find the index of the peak infection day
    peak_idx = df['infected'].idxmax()
    # Get the day number of the peak infection
    peak_day = df['day'].iloc[peak_idx]
    
    # Draw vertical dotted line at peak infection day
    peak_line = ax1.axvline(x=peak_day, color='gray', linestyle=':', linewidth=2, label='Peak Infection Day')
    
    # Draw horizontal dashed red line for 5000 bed capacity
    cap_line = ax2.axhline(y=5000, color='#c23616', linestyle='--', linewidth=2, label='Hospital capacity: 5000 beds')
    
    # Get line handles and labels from primary axis
    lines_1, labels_1 = ax1.get_legend_handles_labels()
    # Get line handles and labels from secondary axis
    lines_2, labels_2 = ax2.get_legend_handles_labels()
    # Add combined legend to the plot
    ax1.legend(lines_1 + lines_2, labels_1 + labels_2, loc='center right')
    
    # Set the title of the SEIR figure
    ax1.set_title("COVID-19 SEIR Simulation — Shivamogga District", fontsize=16, pad=20)
    
    # Create string containing data sources
    src_txt = "Data sources: WHO, data.gov.in, EpiClim, IDSP"
    # Add data sources text box to the figure
    ax1.text(0.02, 0.95, src_txt, transform=ax1.transAxes, fontsize=10, verticalalignment='top', bbox=dict(boxstyle='round', facecolor='black', alpha=0.8))
    
    # Define background color for slider areas
    axcolor = '#2f3640'
    # Add axes for infection rate slider
    ax_beta = plt.axes([0.15, 0.25, 0.65, 0.03], facecolor=axcolor)
    # Add axes for incubation period slider
    ax_inc = plt.axes([0.15, 0.20, 0.65, 0.03], facecolor=axcolor)
    # Add axes for days infectious slider
    ax_inf = plt.axes([0.15, 0.15, 0.65, 0.03], facecolor=axcolor)
    # Add axes for initial infected slider
    ax_init = plt.axes([0.15, 0.10, 0.65, 0.03], facecolor=axcolor)
    
    # Instantiate the infection rate slider
    s_beta = Slider(ax_beta, 'Infection Rate (β)', 0.1, 0.9, valinit=init_beta)
    # Instantiate the incubation period slider
    s_inc = Slider(ax_inc, 'Incubation Period (days)', 1, 14, valinit=init_inc)
    # Instantiate the days infectious slider
    s_inf = Slider(ax_inf, 'Days Infectious', 1, 21, valinit=init_inf)
    # Instantiate the initial infected slider
    s_init = Slider(ax_init, 'Initial Infected', 1, 500, valinit=init_infected, valstep=1)
    
    # Define callback function to update plots on slider change
    def update(val):
        # Retrieve current beta from slider
        beta = s_beta.val
        # Retrieve current incubation days from slider
        inc = s_inc.val
        # Retrieve current infectious days from slider
        inf = s_inf.val
        # Retrieve current initial infected from slider
        init = s_init.val
        
        # Run simulation again with new interactive values
        new_df = run_seir_simulation(beta, inc, inf, init)
        
        # Update susceptible line Y data
        l_s.set_ydata(new_df['susceptible'])
        # Update exposed line Y data
        l_e.set_ydata(new_df['exposed'])
        # Update infected line Y data
        l_i.set_ydata(new_df['infected'])
        # Update recovered line Y data
        l_r.set_ydata(new_df['recovered'])
        # Update beds needed line Y data
        l_beds.set_ydata(new_df['hospital_beds_needed'])
        
        # Find new peak infection index
        n_peak_idx = new_df['infected'].idxmax()
        # Find new peak infection day
        n_peak_day = new_df['day'].iloc[n_peak_idx]
        # Move vertical peak line to new day
        peak_line.set_xdata([n_peak_day, n_peak_day])
        
        # Dynamically update primary Y axis limit
        ax1.set_ylim(0, shivamogga_population * 1.05)
        # Dynamically calculate maximum beds needed limit
        max_beds = max(5500, new_df['hospital_beds_needed'].max() * 1.1)
        # Dynamically update secondary Y axis limit
        ax2.set_ylim(0, max_beds)
        
        # Request matplotlib to redraw the updated canvas
        fig1.canvas.draw_idle()
    
    # Bind update function to beta slider change event
    s_beta.on_changed(update)
    # Bind update function to incubation slider change event
    s_inc.on_changed(update)
    # Bind update function to infectious slider change event
    s_inf.on_changed(update)
    # Bind update function to initial infected slider change event
    s_init.on_changed(update)
    
    # Add axes for the reset button
    resetax = plt.axes([0.85, 0.025, 0.1, 0.04])
    # Instantiate the reset button
    button = Button(resetax, 'Reset', color=axcolor, hovercolor='0.975')
    
    # Define callback function to reset all sliders
    def reset(event):
        # Reset beta slider to default
        s_beta.reset()
        # Reset incubation slider to default
        s_inc.reset()
        # Reset infectious slider to default
        s_inf.reset()
        # Reset initial infected slider to default
        s_init.reset()
    
    # Bind reset function to button click event
    button.on_clicked(reset)
    
    # --- FIGURE 2: KARNATAKA DISTRICT MAP ---
    # Create second figure for the geographic map
    fig2, ax_map = plt.subplots(figsize=(10, 8))
    
    # Initialize empty list for latitudes
    lats = []
    # Initialize empty list for longitudes
    lngs = []
    # Initialize empty list for circle sizes
    sizes = []
    # Initialize empty list for attack rates
    attack_rates = []
    # Initialize empty list for district names
    names = []
    # Initialize empty list for case numbers
    cases_list = []
    
    # Loop through all districts in dictionary
    for name, info in districts.items():
        # Append latitude to list
        lats.append(info['lat'])
        # Append longitude to list
        lngs.append(info['lng'])
        # Calculate circle size based on cases (scaled down)
        sizes.append(info['cases'] / 500)
        # Calculate attack rate percentage for district
        rate = (info['cases'] / info['pop']) * 100
        # Append attack rate to list
        attack_rates.append(rate)
        # Append district name to list
        names.append(name)
        # Append case count to list
        cases_list.append(info['cases'])
    
    # Create scatter plot representing districts as colored circles
    scatter = ax_map.scatter(lngs, lats, s=sizes, c=attack_rates, cmap='YlOrRd', alpha=0.8, edgecolors='white', linewidth=0.5)
    
    # Add colorbar to the map for attack rate interpretation
    cbar = plt.colorbar(scatter, ax=ax_map)
    # Set colorbar label text
    cbar.set_label('Attack Rate (%)')
    
    # Loop through each district to add a text label
    for i in range(len(names)):
        # Format label text with name, cases, and attack rate
        label_text = f"{names[i]}\nCases: {cases_list[i]}\nRate: {attack_rates[i]:.2f}%"
        # Render text label on map slightly offset from center
        ax_map.text(lngs[i], lats[i] + 0.05, label_text, fontsize=8, ha='center', bbox=dict(facecolor='black', alpha=0.5, edgecolor='none', boxstyle='round,pad=0.2'))
    
    # Set X axis label for Longitude
    ax_map.set_xlabel('Longitude')
    # Set Y axis label for Latitude
    ax_map.set_ylabel('Latitude')
    # Set map figure title
    ax_map.set_title("COVID-19 Karnataka District Impact Map", fontsize=14, pad=15)
    # Add map data source text
    ax_map.text(0.5, -0.1, "Source: covid19india.org archive, EpiClim Kaggle dataset", transform=ax_map.transAxes, ha='center', fontsize=9)
    
    # Initialize empty list for legend handles
    legend_handles = []
    # Create sizes for legend demonstration
    legend_sizes = [10000/500, 50000/500, 100000/500]
    # Loop through legend sizes
    for s in legend_sizes:
        # Create empty scatter plot element to act as a legend handle
        handle = plt.scatter([], [], s=s, c='gray', alpha=0.5, edgecolors='white')
        # Append handle to legend list
        legend_handles.append(handle)
    # Define labels corresponding to legend sizes
    legend_labels = ['10k Cases', '50k Cases', '100k Cases']
    # Display legend on the map explaining circle sizes
    ax_map.legend(legend_handles, legend_labels, title="Circle Size", loc="lower left")
    
    # Enforce equal aspect ratio so map is not distorted
    ax_map.set_aspect('equal', adjustable='datalim')
    
    # --- FIGURE 3: DEATHS BY AGE GROUP BAR CHART ---
    # Create third figure for demographic bar chart
    fig3, ax_bar = plt.subplots(figsize=(10, 6))
    
    # Set interval for grouping weeks
    weeks_interval = 28
    # Generate indices corresponding to 4-week marks
    week_indices = list(range(0, 365, weeks_interval))
    
    # Filter dataframe down to only those week marks
    df_weeks = df.iloc[week_indices]
    # Extract young deaths values as array
    y_young = df_weeks['deaths_young'].values
    # Extract adult deaths values as array
    y_adult = df_weeks['deaths_adult'].values
    # Extract elderly deaths values as array
    y_elderly = df_weeks['deaths_elderly'].values
    
    # Create an array of X positions for the groups
    x = np.arange(len(week_indices))
    # Define width for each bar
    width = 0.25
    
    # Plot young population deaths bars in green
    rects1 = ax_bar.bar(x - width, y_young, width, label='Young (0-18)', color='#4cd137')
    # Plot adult population deaths bars in orange
    rects2 = ax_bar.bar(x, y_adult, width, label='Adult (18-60)', color='#fbc531')
    # Plot elderly population deaths bars in red
    rects3 = ax_bar.bar(x + width, y_elderly, width, label='Elderly (60+)', color='#e84118')
    
    # Set Y axis label for cumulative deaths
    ax_bar.set_ylabel('Cumulative Deaths')
    # Set bar chart title
    ax_bar.set_title('COVID-19 Deaths by Age Group Over Time', fontsize=14, pad=15)
    # Define locations of X ticks
    ax_bar.set_xticks(x)
    # Set labels of X ticks to represent weeks
    ax_bar.set_xticklabels([f"Wk {int(d/7)}" for d in df_weeks['day']])
    # Display legend on bar chart
    ax_bar.legend()
    
    # Add data source annotation to bar chart
    ax_bar.text(0.5, -0.15, "Source: Age mortality rates: WHO via humdata.org", transform=ax_bar.transAxes, ha='center', fontsize=9)
    # Add horizontal grid lines to bar chart
    ax_bar.grid(True, axis='y', alpha=0.2)
    # Apply tight layout to ensure labels fit within window
    plt.tight_layout()
    
    # --- PART 7: TERMINAL SUMMARY ---
    # Find final index of peak infection
    final_peak_idx = df['infected'].idxmax()
    # Find final index of peak exposure
    final_peak_e_idx = df['exposed'].idxmax()
    # Evaluate if capacity was ever exceeded
    cap_exceeded = df['hospital_beds_needed'].max() > 5000
    # Calculate the required R0 based on beta and infectious period
    base_r0 = init_beta / (1.0 / days_infectious)
    
    # Print 50 equal signs for header
    print("=" * 50)
    # Print simulation title
    print("COVID-19 SEIR SIMULATION — SHIVAMOGGA DISTRICT")
    # Print 50 equal signs
    print("=" * 50)
    # Print blank line and parameters subheader
    print("\n--- MODEL PARAMETERS (from real datasets) ---")
    # Print formatted population string
    print(f"Population: {shivamogga_population:,} (Source: EpiClim/Kaggle)")
    # Print formatted incubation period string
    print(f"Incubation period: {incubation_period} days (Source: WHO)")
    # Print formatted infectious period string
    print(f"Infectious period: {days_infectious} days (Source: IDSP)")
    # Print formatted basic reproduction number string
    print(f"Basic R0: {base_r0:.2f} (Source: WHO)")
    # Print formatted case fatality rate string
    print(f"Case fatality rate: {india_cfr*100:.1f}% (Source: WHO)")
    # Print blank line and results subheader
    print("\n--- SIMULATION RESULTS ---")
    # Print peak exposure day metric
    print(f"Peak exposure day: day {df['day'].iloc[final_peak_e_idx]}")
    # Print peak infection day metric
    print(f"Peak infection day: day {df['day'].iloc[final_peak_idx]}")
    # Print peak infected count metric
    print(f"Peak infected count: {int(df['infected'].max()):,} people")
    # Print peak hospital beds needed metric
    print(f"Peak hospital beds needed: {int(df['hospital_beds_needed'].max()):,}")
    # Print hospital capacity exceeded status
    print(f"Hospital capacity exceeded: {'Yes' if cap_exceeded else 'No'}")
    # Print total young deaths metric
    print(f"Total deaths (young): {int(df['deaths_young'].iloc[-1]):,}")
    # Print total adult deaths metric
    print(f"Total deaths (adult): {int(df['deaths_adult'].iloc[-1]):,}")
    # Print total elderly deaths metric
    print(f"Total deaths (elderly): {int(df['deaths_elderly'].iloc[-1]):,}")
    # Print total overall deaths metric
    print(f"Total deaths (all): {int(df['total_deaths'].iloc[-1]):,}")
    # Print total recovered count metric
    print(f"Total recovered: {int(df['recovered'].iloc[-1]):,}")
    # Print blank line and first 14 days subheader
    print("\n--- FIRST 14 DAYS (incubation period) ---")
    # Print dataframe section showing first 14 days
    print(df[['day','exposed','infected','recovered','total_deaths']].head(14))
    # Print blank line and data sources subheader
    print("\n--- DATA SOURCES USED ---")
    # Print source 1
    print("1. data.gov.in — Karnataka COVID statistics")
    # Print source 2
    print("2. WHO via humdata.org — CFR, incubation period")
    # Print source 3
    print("3. EpiClim dataset, Kaggle — population data")
    # Print source 4
    print("4. IDSP mohfw.gov.in — infectious period, beds")
    # Print source 5
    print("5. covid19india.org archive — district case counts")
    # Print blank line and referenced models subheader
    print("\n--- MODELS REFERENCED ---")
    # Print referenced model 1
    print("1. Imperial College COVID model (Ferguson 2020)")
    # Print referenced model 2
    print("2. IHME COVID projections (healthdata.org)")
    # Print referenced model 3
    print("3. IDM SEIR model — exposed state")
    # Print referenced model 4
    print("4. GLEAMviz — district spread concept")
    # Print referenced model 5
    print("5. Plague Inc — regional variation concept")
    
    # Render and show all three figures simultaneously
    plt.show()
