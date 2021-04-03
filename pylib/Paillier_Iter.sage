load('scalprod.spyx')
load('utils.sage')
import time
import random
import collections
from multiprocessing.pool import ThreadPool
def integer_inverse_modulo(x,N):
	test=1+N*randint(-1000,1000)
        x_inverse=mod(test/x, N)
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
def P_Enc_Iter(s,M,Len,Iter):
	###s, security parameter
	### M is the plain-text range
	### Len is the plain-text message length
	### Iter is the number of iterations
	Private_inter_1=Private_key(s)
	p=Private_inter_1[0]
	q=Private_inter_1[1]
	Public_key_1=Public_key(p,q)
	n,g,lmd,mu=Public_key(p,q)
	Encryption_Time_Table=[]
	Decryption_Time_Table=[]
	Counter_Total=0
	for tt in range(0,Iter):
		Counter=0
		print '############### Begin of Iteration number', tt
		Plain_text_Mess=matrix(1,Len)
		Plain_text_Decr_Mess=matrix(1,Len)
		Cipher_Mess=[]
		for fff in range(0,Len):
			Plain_text_Mess[0,fff]=randint(1,M)
		print 'Plain-text Message=', Plain_text_Mess
		print '#########Begining of Encryption at Iteration', tt
		t1=cputime()
		for fff in range(0,Len):
			x_0=Plain_text_Mess[0,fff]
			cipher_0=P_Encrypt(n,g,x_0)
			Cipher_Mess.append(cipher_0)
		t_ex=cputime()-t1
		print 'Encryption Time at iteration', tt, '=', t_ex
		Encryption_Time_Table.append(t_ex)
		print '#########Begining of Decryption at Iteration', tt
		t_ex=0
		for fff in range(0,Len):
			cipher_0=Cipher_Mess[fff]
			Dec_Output_0=P_Decrypt(mu,n,lmd,cipher_0)
			plaintext_0=Dec_Output_0[0]
			t_Dec_value=Dec_Output_0[1]
			t_ex=t_ex+t_Dec_value
			Plain_text_Decr_Mess[0,fff]=plaintext_0
			if plaintext_0==Plain_text_Mess[0,fff]:
				Counter=Counter+1
			if Counter==Len:
				print 'The scheme is working for iteration', tt
		print 'Decryption Time at iteration', tt, '=', t_ex
		Decryption_Time_Table.append(t_ex)
		print 'plain-text Decr Message=', Plain_text_Decr_Mess
		print '############End of iteration', tt
		if Counter==Len:
			Counter_Total=Counter_Total+1
	if Counter_Total==Iter:
		print 'The Scheme is working for all iterations'	
	print 'Mean Encryption Execution time=', mean(Encryption_Time_Table), 'in seconds'
	print 'Mean Decryption Execution time=', mean(Decryption_Time_Table), 'in seconds'


print("CHOU L WADE333")