import math
R = 0.5 # outer radius in meters
t = 0.02 # thickness in meters
yield_stress = 250 # yield stress in MPa
# Calculating hoop stress
hoop_stress = lambda P: (P * R) / (2 * (R - t))
# Calculating the maximum internal pressure (critical pressure)
# This is derived from the hoop stress formula
# Since yield stress is given, we can assume the calculated Hoop Stress <= Yield Stress
internal_pressure = max(hoop_stress(yield_stress), 0)
internal_pressure