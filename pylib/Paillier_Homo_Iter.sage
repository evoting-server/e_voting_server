load('utils.sage')
import time
import random
import collections
from multiprocessing.pool import ThreadPool
def integer_inverse_modulo(x,N):
	test=1+N*randint(-1000,1000)
        x_inverse=mod(test/x,N)
	return x_inverse  
def Private_key(security_parameter):
	p=random_prime(2^(security_parameter//2),lbound=2^(security_parameter//2 -1))
	q=random_prime(2^(security_parameter//2),lbound=2^(security_parameter//2 -1))
	return p,q

def Public_key(p,q):
	n=p*q
	g=n+1
	lmd=mod(lcm(p-1,q-1),n)
	mu=(lmd**(-1))%n
	return n,g,lmd,mu
def P_Encrypt(n,g,m):
	c=0
	while(c==0):
		r=randint(1,n)
		c=(pow(g,m,n^2)*pow(r,n,n^2))%n^2
	return c 
def P_Decrypt(mu,n,lmd,c):
	t=time.clock()
	m=(((int(pow(c,lmd,n^2))-1)/n)*int(mu))%n
	t1=time.clock()-t
	return m, t1
def P_Enc_Iter_Homo(s,M,Len,Iter):
	###s, security parameter
	### M is the plain-text range
	### Len is the plain-text message length
	### Iter is the number of iterations
	Private_inter_1=Private_key(s)
	p=Private_inter_1[0]
	q=Private_inter_1[1]
	Public_key_1=Public_key(p,q)
	n,g,lmd,mu=Public_key(p,q)
	Homo_Addition_Time_Table=[]
	Counter_Total=0
	for tt in range(0,Iter):
		Counter=0
		print '############### Begin of Iteration number', tt
		Plain_text_Mess_1=matrix(1,Len)
		Plain_text_Mess_2=matrix(1,Len)
		Plain_text_Mess_Add=[]
		Plain_text_Mess_Add_Dec=[]
		Cipher_Mess_1=[]
		Cipher_Mess_2=[]
		Cipher_Mess_Mult=[]
		for fff in range(0,Len):
			Plain_text_Mess_1[0,fff]=randint(1,M)
			Plain_text_Mess_2[0,fff]=randint(1,M)
			Plain_text_Mess_Add.append(Plain_text_Mess_1[0,fff]+Plain_text_Mess_2[0,fff])
		#print 'Plain_text_Mess_1=', Plain_text_Mess_1
		#print 'Plain_text_Mess_2=', Plain_text_Mess_2
		print 'PLain_text_Mess_Add=', Plain_text_Mess_Add
		print '#########Begin of Encryption at Iteration', tt
		for fff in range(0,Len):
			x_0=Plain_text_Mess_1[0,fff]
			cipher_0=P_Encrypt(n,g,x_0)
			Cipher_Mess_1.append(cipher_0)
			y_0=Plain_text_Mess_2[0,fff]
			cipher_0=P_Encrypt(n,g,y_0)
			Cipher_Mess_2.append(cipher_0)
		print '#########End of Encryption at iteration', tt
		print 'Begin of homomorphic operation at iteration', tt
		t1=cputime()
		for fff in range(0,Len):
			Cipher_Mess_Mult.append(Cipher_Mess_1[fff]*Cipher_Mess_2[fff])
		t_mult=cputime()-t1
		Homo_Addition_Time_Table.append(t_mult)
		print 'Homomorphic Multiplication at iteration', tt, '=', t_mult
		for fff in range(0,Len):
			cipher_0=Cipher_Mess_Mult[fff]
			Dec_Output_0=P_Decrypt(mu,n,lmd,cipher_0)
			plaintext_0=Dec_Output_0[0]
			Plain_text_Mess_Add_Dec.append(plaintext_0)
		print 'Plain_text_Mess_Add_Dec=', Plain_text_Mess_Add_Dec
		for fff in range(0,Len):
			if Plain_text_Mess_Add_Dec[fff]==Plain_text_Mess_Add[fff]:
				Counter=Counter+1
		if Counter==Len:
			print 'Homomorphic addition is working for iteration', tt
			Counter_Total=Counter_Total+1
	if Counter_Total==Iter:
		print 'Homomorphic addition is working for all iterations'
	print 'mean homomorphic addition time=', mean(Homo_Addition_Time_Table), 's'
		
		
