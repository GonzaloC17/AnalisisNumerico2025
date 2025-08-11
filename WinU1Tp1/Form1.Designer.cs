namespace WinU1Tp1
{
    partial class Form1
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            button1 = new Button();
            TxtFuncion = new TextBox();
            TxtXd = new TextBox();
            TxtXi = new TextBox();
            label1 = new Label();
            label2 = new Label();
            label3 = new Label();
            TxtIteraciones = new TextBox();
            label4 = new Label();
            TxtTol = new TextBox();
            label5 = new Label();
            TxtMetodo = new TextBox();
            label6 = new Label();
            label7 = new Label();
            SuspendLayout();
            // 
            // button1
            // 
            button1.Location = new Point(247, 214);
            button1.Name = "button1";
            button1.Size = new Size(75, 23);
            button1.TabIndex = 0;
            button1.Text = "Calcular";
            button1.UseVisualStyleBackColor = true;
            button1.Click += button1_Click;
            // 
            // TxtFuncion
            // 
            TxtFuncion.Location = new Point(141, 65);
            TxtFuncion.Name = "TxtFuncion";
            TxtFuncion.Size = new Size(100, 23);
            TxtFuncion.TabIndex = 1;
            // 
            // TxtXd
            // 
            TxtXd.Location = new Point(247, 118);
            TxtXd.Name = "TxtXd";
            TxtXd.Size = new Size(100, 23);
            TxtXd.TabIndex = 2;
            // 
            // TxtXi
            // 
            TxtXi.Location = new Point(141, 118);
            TxtXi.Name = "TxtXi";
            TxtXi.Size = new Size(100, 23);
            TxtXi.TabIndex = 3;
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(141, 47);
            label1.Name = "label1";
            label1.Size = new Size(50, 15);
            label1.TabIndex = 4;
            label1.Text = "Funcion";
            label1.Click += label1_Click;
            // 
            // label2
            // 
            label2.AutoSize = true;
            label2.Location = new Point(141, 100);
            label2.Name = "label2";
            label2.Size = new Size(17, 15);
            label2.TabIndex = 5;
            label2.Text = "Xi";
            // 
            // label3
            // 
            label3.AutoSize = true;
            label3.Location = new Point(247, 100);
            label3.Name = "label3";
            label3.Size = new Size(21, 15);
            label3.TabIndex = 6;
            label3.Text = "Xd";
            // 
            // TxtIteraciones
            // 
            TxtIteraciones.Location = new Point(141, 172);
            TxtIteraciones.Name = "TxtIteraciones";
            TxtIteraciones.Size = new Size(100, 23);
            TxtIteraciones.TabIndex = 7;
            // 
            // label4
            // 
            label4.AutoSize = true;
            label4.Location = new Point(141, 154);
            label4.Name = "label4";
            label4.Size = new Size(64, 15);
            label4.TabIndex = 8;
            label4.Text = "Iteraciones";
            // 
            // TxtTol
            // 
            TxtTol.Location = new Point(247, 172);
            TxtTol.Name = "TxtTol";
            TxtTol.Size = new Size(100, 23);
            TxtTol.TabIndex = 9;
            // 
            // label5
            // 
            label5.AutoSize = true;
            label5.Location = new Point(247, 154);
            label5.Name = "label5";
            label5.Size = new Size(0, 15);
            label5.TabIndex = 10;
            // 
            // TxtMetodo
            // 
            TxtMetodo.Location = new Point(141, 215);
            TxtMetodo.Name = "TxtMetodo";
            TxtMetodo.Size = new Size(100, 23);
            TxtMetodo.TabIndex = 11;
            // 
            // label6
            // 
            label6.AutoSize = true;
            label6.Location = new Point(141, 198);
            label6.Name = "label6";
            label6.Size = new Size(49, 15);
            label6.TabIndex = 12;
            label6.Text = "Metodo";
            // 
            // label7
            // 
            label7.AutoSize = true;
            label7.Location = new Point(247, 154);
            label7.Name = "label7";
            label7.Size = new Size(61, 15);
            label7.TabIndex = 13;
            label7.Text = "Tolerancia";
            // 
            // Form1
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(800, 450);
            Controls.Add(label7);
            Controls.Add(label6);
            Controls.Add(TxtMetodo);
            Controls.Add(label5);
            Controls.Add(TxtTol);
            Controls.Add(label4);
            Controls.Add(TxtIteraciones);
            Controls.Add(label3);
            Controls.Add(label2);
            Controls.Add(label1);
            Controls.Add(TxtXi);
            Controls.Add(TxtXd);
            Controls.Add(TxtFuncion);
            Controls.Add(button1);
            Name = "Form1";
            Text = "Form1";
            Load += Form1_Load;
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Button button1;
        private TextBox TxtFuncion;
        private TextBox TxtXd;
        private TextBox TxtXi;
        private Label label1;
        private Label label2;
        private Label label3;
        private TextBox TxtIteraciones;
        private Label label4;
        private TextBox TxtTol;
        private Label label5;
        private TextBox TxtMetodo;
        private Label label6;
        private Label label7;
    }
}
