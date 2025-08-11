using System;
using System.Collections.Generic;
using System.Diagnostics.Eventing.Reader;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WinU1Tp1.Metodos
{
    internal class Biseccion
    {
        public static double Calcular(Func<double, double> F, double a, double b, double tolerancia, int MaxIteraciones)
        {
            double Fi = F(a);
            double Fd = F(b);

            if (Fi * Fd >= 0)
                throw new Exception("La función debe tener signos opuestos en los extremos del intervalo [a, b]");

            double c = 0;

            for (int i=0; i < MaxIteraciones; i++ )
            {
                c = (Fi + Fd) / 2;
                double Fc = F(c);
                if (Math.Abs(Fc) < tolerancia)
                    return c;

                if (Fc * Fi < 0)
                {
                    b = c;
                    Fd = Fc;
                }
                else { 
                    a = c;
                    Fi = Fc;
                }

                
            }            

            return c; 
        }

    }
}
